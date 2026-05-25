import "server-only"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

function getStoreHeaders() {
  const headers: Record<string, string> = {}

  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  return headers
}

export async function getSiteContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  try {
    const params = new URLSearchParams({
      section,
    })

    if (locale) {
      params.set("locale", locale)
    }

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/site-content?${params.toString()}`,
      {
        method: "GET",
        headers: getStoreHeaders(),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return fallback
    }

    const payload = (await response.json()) as { data?: T | null }

    return payload.data ?? fallback
  } catch {
    return fallback
  }
}

export async function saveSiteContentSection(
  section: string,
  data: unknown,
  locale?: string | null
) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/site-content`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-content-admin-secret": process.env.CONTENT_ADMIN_SECRET || "",
    },
    body: JSON.stringify({
      section,
      locale: locale || undefined,
      data,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to save content")
  }

  return response.json()
}
