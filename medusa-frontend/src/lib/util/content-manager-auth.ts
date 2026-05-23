import "server-only"

import { cookies } from "next/headers"

export const CONTENT_MANAGER_COOKIE = "content_manager_auth"

export function getContentManagerKey() {
  return process.env.CONTENT_MANAGER_KEY || process.env.CONTENT_ADMIN_SECRET || ""
}

export async function isContentManagerAuthorized() {
  const key = getContentManagerKey()

  if (!key) {
    return true
  }

  const cookieStore = await cookies()

  return cookieStore.get(CONTENT_MANAGER_COOKIE)?.value === key
}
