"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  ADMIN_AUTH_COOKIE,
  createAdminSessionToken,
  getAdminEmail,
  getAdminPassword,
} from "@/lib/admin-auth"

type Attempt = {
  count: number
  lockedUntil: number
}

const MAX_ATTEMPTS = 5
const LOCK_MS = 5 * 60 * 1000
const attempts = new Map<string, Attempt>()

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/admin"
  const isLocalPath = next.startsWith("/") && !next.startsWith("//")

  return isLocalPath &&
    (next.startsWith("/admin") || next.includes("/content-manager")) &&
    !next.startsWith("/admin/login")
    ? next
    : "/admin"
}

async function clientKey() {
  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()

  // ponytail: per-process lockout; use DB/Redis if multiple app instances need shared state.
  return forwarded || headersList.get("x-real-ip") || "local"
}

export async function loginAdmin(formData: FormData) {
  const now = Date.now()
  const key = await clientKey()
  const attempt = attempts.get(key)
  const next = safeNext(formData.get("next"))

  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    redirect(`/admin/login?error=locked&next=${encodeURIComponent(next)}`)
  }

  if (attempt?.lockedUntil && attempt.lockedUntil <= now) {
    attempts.delete(key)
  }

  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  if (email === getAdminEmail() && password === getAdminPassword()) {
    attempts.delete(key)
    const cookieStore = await cookies()

    cookieStore.set(ADMIN_AUTH_COOKIE, await createAdminSessionToken(), {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    redirect(next)
  }

  const count = (attempts.get(key)?.count || 0) + 1
  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCK_MS : 0

  attempts.set(key, { count, lockedUntil })

  if (lockedUntil) {
    redirect(`/admin/login?error=locked&next=${encodeURIComponent(next)}`)
  }

  redirect(
    `/admin/login?error=invalid&left=${MAX_ATTEMPTS - count}&next=${encodeURIComponent(next)}`
  )
}

export async function logoutAdmin() {
  const cookieStore = await cookies()

  cookieStore.delete(ADMIN_AUTH_COOKIE)
  redirect("/admin/login")
}
