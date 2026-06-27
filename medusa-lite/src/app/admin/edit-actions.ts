"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"
import * as XLSX from "xlsx"

import { prisma } from "@/lib/db"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"
import { CACHE_TAGS } from "@/lib/data/cache"

type CatalogDb = Pick<typeof prisma, "category" | "product">

async function requireAdmin() {
  const cookieStore = await cookies()
  const ok = await isAdminSessionToken(cookieStore.get(ADMIN_AUTH_COOKIE)?.value)

  if (!ok) {
    redirect("/admin/login")
  }
}

function readString(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim()
}

function readJsonObject(value: string) {
  if (!value) {
    return {}
  }

  const parsed = JSON.parse(value) as unknown

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("Expected a JSON object")
  }

  return parsed
}

function readLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function saveErrorCode(error: unknown) {
  return (error as { code?: string }).code === "P2002" ? "duplicate" : "save"
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return (
    slug ||
    `item-${Array.from(value)
      .map((char) => char.codePointAt(0)?.toString(36) || "")
      .join("")
      .slice(0, 24)}`
  )
}

async function uniqueCategoryHandle(db: CatalogDb, base: string) {
  let handle = base
  let index = 2

  while (await db.category.findUnique({ where: { handle } })) {
    handle = `${base}-${index++}`
  }

  return handle
}

async function productHandleForTitle(db: CatalogDb, title: string) {
  const base = slugify(title)
  let handle = base
  let index = 2

  while (true) {
    const existing = await db.product.findUnique({
      where: { handle },
      select: { title: true },
    })

    if (!existing || existing.title === title) {
      return handle
    }

    handle = `${base}-${index++}`
  }
}

function hasColumn(row: Record<string, unknown>, names: string[]) {
  const normalizedNames = names.map((name) =>
    name.replace(/\s+/g, "").toLowerCase()
  )

  return Object.keys(row).some((key) =>
    normalizedNames.includes(key.replace(/\s+/g, "").toLowerCase())
  )
}

function rowValue(row: Record<string, unknown>, names: string[]) {
  const normalizedNames = names.map((name) =>
    name.replace(/\s+/g, "").toLowerCase()
  )

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.replace(/\s+/g, "").toLowerCase()

    if (normalizedNames.includes(normalizedKey)) {
      return String(value || "").trim()
    }
  }

  return ""
}

function splitCategories(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,，;；\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

export async function updateProduct(formData: FormData) {
  await requireAdmin()

  const id = readString(formData, "id")
  const title = readString(formData, "title")
  const handle = readString(formData, "handle")

  if (!id || !title || !handle) {
    redirect(`/admin/products/${id || ""}?error=required`)
  }

  let metadata: Record<string, unknown>

  try {
    metadata = readJsonObject(readString(formData, "metadata")) as Record<
      string,
      unknown
    >
  } catch {
    redirect(`/admin/products/${id}?error=metadata`)
  }

  const titleZh = readString(formData, "title_zh")
  const titleAr = readString(formData, "title_ar")
  const descriptionZh = readString(formData, "description_zh")
  const descriptionAr = readString(formData, "description_ar")

  if (titleZh) {
    metadata.title_zh = titleZh
  } else {
    delete metadata.title_zh
  }

  if (titleAr) {
    metadata.title_ar = titleAr
  } else {
    delete metadata.title_ar
  }

  if (descriptionZh) {
    metadata.description_zh = descriptionZh
  } else {
    delete metadata.description_zh
  }

  if (descriptionAr) {
    metadata.description_ar = descriptionAr
  } else {
    delete metadata.description_ar
  }

  const categoryIds = formData
    .getAll("categoryIds")
    .map(String)
    .filter(Boolean)

  const thumbnail = readString(formData, "thumbnail")
  const imageUrls = readLines(readString(formData, "images"))

  try {
    await prisma.product.update({
      where: { id },
      data: {
        title,
        handle,
        subtitle: readString(formData, "subtitle") || null,
        description: readString(formData, "description") || null,
        thumbnail: thumbnail || null,
        status: readString(formData, "status") || "published",
        tags: readLines(readString(formData, "tags")),
        images: imageUrls.map((url) => ({ url })),
        metadata,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    })
  } catch (error) {
    redirect(`/admin/products/${id}?error=${saveErrorCode(error)}`)
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}`)
  redirect(`/admin/products/${id}?saved=1`)
}

export async function createProduct(formData: FormData) {
  await requireAdmin()

  const title = readString(formData, "title")
  const handle = readString(formData, "handle")

  if (!title || !handle) {
    redirect("/admin/products?error=required")
  }

  let product: { id: string }

  try {
    product = await prisma.product.create({
      data: {
        title,
        handle,
        status: "published",
        images: [],
        tags: [],
        metadata: {},
      },
    })
  } catch (error) {
    redirect(`/admin/products?error=${saveErrorCode(error)}`)
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  redirect(`/admin/products/${product.id}?saved=1`)
}

export async function importProducts(formData: FormData) {
  await requireAdmin()

  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/products?error=import")
  }

  let rows: Record<string, unknown>[]

  try {
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), {
      type: "buffer",
    })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rows = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "" }) : []
  } catch {
    redirect("/admin/products?error=import")
  }

  if (
    rows.length > 0 &&
    (!hasColumn(rows[0], ["图片", "图片url", "image", "image url"]) ||
      !hasColumn(rows[0], ["名称", "商品名称", "name", "title"]) ||
      !hasColumn(rows[0], ["分类", "category", "categories"]))
  ) {
    redirect("/admin/products?error=import")
  }

  let imported = 0

  try {
    await prisma.$transaction(async (tx) => {
      const lastCategory = await tx.category.findFirst({
        orderBy: { rank: "desc" },
        select: { rank: true },
      })
      let nextRank = (lastCategory?.rank ?? 0) + 1

      for (const row of rows) {
        const imageUrl = rowValue(row, ["图片", "图片url", "image", "image url"])
        const title = rowValue(row, ["名称", "商品名称", "name", "title"])
        const categoryNames = splitCategories(
          rowValue(row, ["分类", "category", "categories"])
        )

        if (!title) {
          continue
        }

        const categories = []

        for (const name of categoryNames) {
          const existing = await tx.category.findFirst({ where: { name } })

          categories.push(
            existing ||
              (await tx.category.create({
                data: {
                  name,
                  handle: await uniqueCategoryHandle(tx, slugify(name)),
                  metadata: {},
                  isActive: true,
                  rank: nextRank++,
                },
              }))
          )
        }

        const handle = await productHandleForTitle(tx, title)
        const images = imageUrl ? [{ url: imageUrl }] : []

        await tx.product.upsert({
          where: { handle },
          create: {
            title,
            handle,
            thumbnail: imageUrl || null,
            images,
            status: "published",
            tags: [],
            metadata: {},
            categories: {
              create: categories.map((category) => ({
                categoryId: category.id,
              })),
            },
          },
          update: {
            title,
            thumbnail: imageUrl || null,
            images,
            categories: {
              deleteMany: {},
              create: categories.map((category) => ({
                categoryId: category.id,
              })),
            },
          },
        })
        imported++
      }
    })
  } catch {
    redirect("/admin/products?error=import")
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  revalidateTag(CACHE_TAGS.categories, "max")
  redirect(`/admin/products?imported=${imported}`)
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin()

  const id = readString(formData, "id")
  if (!id) {
    redirect("/admin/products?error=required")
  }

  await prisma.product.delete({ where: { id } })

  revalidatePath("/admin/products")
  revalidatePath("/products")
  redirect("/admin/products?deleted=1")
}

export async function bulkDeleteProducts(formData: FormData) {
  await requireAdmin()

  const ids = formData.getAll("ids").map(String).filter(Boolean)
  if (!ids.length) {
    redirect("/admin/products?error=required")
  }

  await prisma.product.deleteMany({ where: { id: { in: ids } } })

  revalidatePath("/admin/products")
  revalidatePath("/products")
  redirect("/admin/products?deleted=1")
}

export async function updateCategory(formData: FormData) {
  await requireAdmin()

  const id = readString(formData, "id")
  const name = readString(formData, "name")
  const handle = readString(formData, "handle")

  if (!id || !name || !handle) {
    redirect(`/admin/categories/${id || ""}?error=required`)
  }

  let metadata: Record<string, unknown>

  try {
    metadata = readJsonObject(readString(formData, "metadata")) as Record<
      string,
      unknown
    >
  } catch {
    redirect(`/admin/categories/${id}?error=metadata`)
  }

  const image = readString(formData, "image")

  if (image) {
    metadata.image = image
  } else {
    delete metadata.image
  }

  const parentId = readString(formData, "parentId")
  const rank = Number.parseInt(readString(formData, "rank"), 10)

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        handle,
        description: readString(formData, "description") || null,
        metadata,
        isActive: formData.get("isActive") === "on",
        parentId: parentId && parentId !== id ? parentId : null,
        rank: Number.isFinite(rank) ? rank : 0,
      },
    })
  } catch (error) {
    redirect(`/admin/categories/${id}?error=${saveErrorCode(error)}`)
  }

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath("/")
  revalidateTag(CACHE_TAGS.categories)
  redirect(`/admin/categories/${id}?saved=1`)
}

export async function createCategory(formData: FormData) {
  await requireAdmin()

  const name = readString(formData, "name")
  const handle = readString(formData, "handle")

  if (!name || !handle) {
    redirect("/admin/categories?error=required")
  }

  const lastCategory = await prisma.category.findFirst({
    orderBy: { rank: "desc" },
    select: { rank: true },
  })

  let category: { id: string }

  try {
    category = await prisma.category.create({
      data: {
        name,
        handle,
        description: null,
        metadata: {},
        isActive: true,
        rank: (lastCategory?.rank ?? 0) + 1,
      },
    })
  } catch (error) {
    redirect(`/admin/categories?error=${saveErrorCode(error)}`)
  }

  revalidatePath("/admin/categories")
  revalidatePath("/")
  revalidateTag(CACHE_TAGS.categories)
  redirect(`/admin/categories/${category.id}?saved=1`)
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin()

  const id = readString(formData, "id")
  if (!id) {
    redirect("/admin/categories?error=required")
  }

  await prisma.category.updateMany({
    where: { parentId: id },
    data: { parentId: null },
  })
  await prisma.category.delete({ where: { id } })

  revalidatePath("/admin/categories")
  revalidatePath("/")
  revalidateTag(CACHE_TAGS.categories)
  redirect("/admin/categories?deleted=1")
}

export async function bulkDeleteCategories(formData: FormData) {
  await requireAdmin()

  const ids = formData.getAll("ids").map(String).filter(Boolean)
  if (!ids.length) {
    redirect("/admin/categories?error=required")
  }

  await prisma.category.updateMany({
    where: { parentId: { in: ids } },
    data: { parentId: null },
  })
  await prisma.category.deleteMany({ where: { id: { in: ids } } })

  revalidatePath("/admin/categories")
  revalidatePath("/")
  revalidateTag(CACHE_TAGS.categories)
  redirect("/admin/categories?deleted=1")
}
