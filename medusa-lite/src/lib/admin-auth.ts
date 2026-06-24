export const ADMIN_AUTH_COOKIE = "lite_admin_auth"

const encoder = new TextEncoder()

export function getAdminEmail() {
  return process.env.LITE_ADMIN_EMAIL || "admin@example.com"
}

export function getAdminPassword() {
  if (!process.env.LITE_ADMIN_PASSWORD && process.env.NODE_ENV === "production") {
    return ""
  }

  return process.env.LITE_ADMIN_PASSWORD || "supersecret"
}

export function getAdminSessionSecret() {
  return (
    process.env.LITE_ADMIN_SESSION_SECRET ||
    process.env.CONTENT_ADMIN_SECRET ||
    process.env.CONTENT_MANAGER_KEY ||
    getAdminPassword() ||
    "local-lite-admin-session"
  )
}

export async function createAdminSessionToken() {
  const data = `${getAdminEmail()}:${getAdminSessionSecret()}`
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data))

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function isAdminSessionToken(value?: string) {
  return Boolean(value) && value === (await createAdminSessionToken())
}
