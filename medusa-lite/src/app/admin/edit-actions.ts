"use server"

import { mkdir, writeFile } from "fs/promises"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import path from "path"

import { prisma } from "@/lib/db"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"

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

async function saveUploadedImage(formData: FormData, key: string, fallback: string) {
  const value = formData.get(key)

  if (!(value instanceof File) || value.size === 0) {
    return fallback
  }

  if (!value.type.startsWith("image/")) {
    return fallback
  }

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }
  const extension = extensionByType[value.type] || "jpg"
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", "admin")
  const filename = `${key}-${Date.now()}.${extension}`
  const destination = path.resolve(uploadDir, filename)

  if (!destination.startsWith(uploadDir)) {
    return fallback
  }

  await mkdir(uploadDir, { recursive: true })
  await writeFile(destination, Buffer.from(await value.arrayBuffer()))

  return `/uploads/admin/${filename}`
}

async function saveUploadedImages(formData: FormData, key: string) {
  const files = formData.getAll(key)
  const urls: string[] = []

  for (let index = 0; index < files.length; index++) {
    const value = files[index]

    if (!(value instanceof File) || value.size === 0) {
      continue
    }

    if (!value.type.startsWith("image/")) {
      continue
    }

    const singleForm = new FormData()
    singleForm.set(`${key}-${index}`, value)
    urls.push(await saveUploadedImage(singleForm, `${key}-${index}`, ""))
  }

  return urls.filter(Boolean)
}

export async function updateProduct(formData: FormData) {
  await requireAdmin()

  const id = readString(formData, "id")
  const title = readString(formData, "title")
  const handle = readString(formData, "handle")

  if (!id || !title || !handle) {
    redirect(`/admin/products/${id || ""}?error=required`)
  }

  let metadata: object

  try {
    metadata = readJsonObject(readString(formData, "metadata"))
  } catch {
    redirect(`/admin/products/${id}?error=metadata`)
  }

  const categoryIds = formData
    .getAll("categoryIds")
    .map(String)
    .filter(Boolean)

  const thumbnail = await saveUploadedImage(
    formData,
    "thumbnailFile",
    readString(formData, "thumbnail")
  )
  const imageUrls = [
    ...readLines(readString(formData, "images")),
    ...(await saveUploadedImages(formData, "imageFiles")),
  ]

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

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}`)
  redirect(`/admin/products/${id}?saved=1`)
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

  const image = await saveUploadedImage(
    formData,
    "imageFile",
    readString(formData, "image")
  )

  if (image) {
    metadata.image = image
  } else {
    delete metadata.image
  }

  const parentId = readString(formData, "parentId")
  const rank = Number.parseInt(readString(formData, "rank"), 10)

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

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${id}`)
  redirect(`/admin/categories/${id}?saved=1`)
}
