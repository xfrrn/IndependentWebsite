import "server-only"

import { cookies } from "next/headers"

import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"

export function getContentManagerKey() {
  return process.env.CONTENT_MANAGER_KEY || process.env.CONTENT_ADMIN_SECRET || ""
}

export async function isContentManagerAuthorized() {
  const cookieStore = await cookies()

  return isAdminSessionToken(cookieStore.get(ADMIN_AUTH_COOKIE)?.value)
}
