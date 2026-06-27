import "server-only"

import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "./cache"

const getDefaultSiteContentSectionCached = unstable_cache(
  async (section: string) => {
    const content = await prisma.siteContent.findUnique({ where: { section } })
    return content?.data ?? null
  },
  ["default-site-content-section"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.siteContent] }
)

const getTranslatedSiteContentSectionCached = unstable_cache(
  async (section: string, locale: string) => {
    const translation = await prisma.siteContentTranslation.findUnique({
      where: { section_locale: { section, locale } },
    })
    return translation?.data ?? null
  },
  ["translated-site-content-section"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.siteContent] }
)

export async function getSiteContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  try {
    if (locale) {
      const translation = await getTranslatedSiteContentSectionCached(section, locale)
      if (translation) return (translation as T) ?? fallback
    }

    const content = await getDefaultSiteContentSectionCached(section)
    return (content as T | null) ?? fallback
  } catch {
    return fallback
  }
}

export async function getTranslatedSiteContentSection<T>(
  section: string,
  locale: string
): Promise<T | null> {
  try {
    return (await getTranslatedSiteContentSectionCached(section, locale)) as T | null
  } catch {
    return null
  }
}

export async function saveSiteContentSection(
  section: string,
  data: unknown,
  locale?: string | null
) {
  const jsonData = data as Prisma.InputJsonValue

  if (locale) {
    const [, item] = await prisma.$transaction([
      prisma.siteContent.upsert({
        where: { section },
        update: {},
        create: { section, data: jsonData },
      }),
      prisma.siteContentTranslation.upsert({
        where: { section_locale: { section, locale } },
        update: { data: jsonData },
        create: { section, locale, data: jsonData },
      }),
    ])
    return { item }
  }

  const item = await prisma.siteContent.upsert({
    where: { section },
    update: { data: jsonData },
    create: { section, data: jsonData },
  })
  return { item }
}
