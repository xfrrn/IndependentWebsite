import "server-only"

import { getHomepageFallback } from "./homepage"
import {
  getSiteContentSection,
  getTranslatedSiteContentSection,
} from "./site-content"

export async function getLocalizedHomeContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  if (locale) {
    const localizedContent = await getTranslatedSiteContentSection<T>(
      section,
      locale
    )
    if (localizedContent) return localizedContent
  }

  const localizedFallback = getHomepageFallback(section, locale)
  if (localizedFallback) return localizedFallback as T

  return getSiteContentSection(section, fallback, locale)
}
