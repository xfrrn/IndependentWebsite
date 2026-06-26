import "server-only"

import { prisma } from "@/lib/db"

export async function getSiteContentSection<T>(
  section: string,
  fallback: T,
  locale?: string | null
): Promise<T> {
  try {
    if (locale) {
      const translation = await prisma.siteContentTranslation.findUnique({
        where: { section_locale: { section, locale } },
      })
      if (translation) return (translation.data as T) ?? fallback
    }

    const content = await prisma.siteContent.findUnique({ where: { section } })
    return (content?.data as T | null) ?? fallback
  } catch {
    return fallback
  }
}

export async function getTranslatedSiteContentSection<T>(
  section: string,
  locale: string
): Promise<T | null> {
  try {
    const translation = await prisma.siteContentTranslation.findUnique({
      where: { section_locale: { section, locale } },
    })
    return (translation?.data as T | null) ?? null
  } catch {
    return null
  }
}

export async function saveSiteContentSection(
  section: string,
  data: unknown,
  locale?: string | null
) {
  if (locale) {
    const [, item] = await prisma.$transaction([
      prisma.siteContent.upsert({
        where: { section },
        update: {},
        create: { section, data },
      }),
      prisma.siteContentTranslation.upsert({
        where: { section_locale: { section, locale } },
        update: { data },
        create: { section, locale, data },
      }),
    ])
    return { item }
  }

  const item = await prisma.siteContent.upsert({
    where: { section },
    update: { data },
    create: { section, data },
  })
  return { item }
}
