import "server-only"

import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"
import { getInternalBaseURL } from "@lib/util/env"

const API_BASE = getInternalBaseURL()

export async function getSiteContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  try {
    const params = new URLSearchParams({ section })
    if (locale) params.set("content_locale", locale)

    const response = await fetch(`${API_BASE}/api/site-content?${params}`, {
      method: "GET",
      next: getCatalogCacheOptions(CACHE_TAGS.siteContent),
      cache: "force-cache",
    })

    if (!response.ok) return fallback

    const payload = (await response.json()) as { data?: T | null }
    return payload.data ?? fallback
  } catch {
    return fallback
  }
}

export async function getTranslatedSiteContentSection<T>(
  section: string,
  locale: string
): Promise<T | null> {
  try {
    const params = new URLSearchParams({ section, content_locale: locale })

    const response = await fetch(`${API_BASE}/api/site-content?${params}`, {
      method: "GET",
      next: getCatalogCacheOptions(CACHE_TAGS.siteContent),
      cache: "force-cache",
    })

    if (!response.ok) return null

    const payload = (await response.json()) as {
      data?: T | null
      locale?: string | null
    }

    return payload.locale === locale ? payload.data ?? null : null
  } catch {
    return null
  }
}

export async function saveSiteContentSection(
  section: string,
  data: unknown,
  locale?: string | null
) {
  const response = await fetch(`${API_BASE}/api/site-content`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-content-admin-secret": process.env.CONTENT_ADMIN_SECRET || "",
    },
    body: JSON.stringify({ section, locale: locale || undefined, data }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Failed to save content (${response.status})`)
  }
  return response.json()
}
