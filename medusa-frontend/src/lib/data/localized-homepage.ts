import "server-only"

import { getHomepageFallback } from "./homepage"
import { getSiteContentSection } from "./site-content"

export async function getLocalizedHomeContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  const localizedFallback = getHomepageFallback(section, locale)

  if (localizedFallback) {
    return localizedFallback as T
  }

  return getSiteContentSection(section, fallback)
}
