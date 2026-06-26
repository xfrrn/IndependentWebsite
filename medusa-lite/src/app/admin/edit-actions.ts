"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"

import { prisma } from "@/lib/db"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"
import { CACHE_TAGS } from "@/lib/data/cache"

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
