import "server-only"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function getSiteContentSection<T>(section: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/site-content?section=${encodeURIComponent(section)}`,
      {
        method: "GET",
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

export async function saveSiteContentSection(section: string, data: unknown) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/site-content`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-content-admin-secret": process.env.CONTENT_ADMIN_SECRET || "",
    },
    body: JSON.stringify({
      section,
      data,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to save content")
  }

  return response.json()
}
