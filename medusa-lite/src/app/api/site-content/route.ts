import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const ADMIN_SECRET = process.env.CONTENT_ADMIN_SECRET || ""
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const section = searchParams.get("section")
  const locale = searchParams.get("locale") || searchParams.get("content_locale")

  if (!section) {
    const items = await prisma.siteContent.findMany({ orderBy: { section: "asc" } })
    return NextResponse.json(
      {
        items: items.map((item) => ({
          section: item.section,
          data: item.data,
          updated_at: item.updatedAt.toISOString(),
        })),
      },
      { headers: CACHE_HEADERS }
    )
  }

  if (locale) {
    const translation = await prisma.siteContentTranslation.findUnique({
      where: { section_locale: { section, locale } },
    })
    if (translation) {
      return NextResponse.json(
        {
          section: translation.section,
          locale: translation.locale,
          data: translation.data,
          updated_at: translation.updatedAt.toISOString(),
        },
        { headers: CACHE_HEADERS }
      )
    }
  }

  const content = await prisma.siteContent.findUnique({ where: { section } })
  if (!content) {
    return NextResponse.json(
      { section, data: null, updated_at: null },
      { headers: CACHE_HEADERS }
    )
  }

  return NextResponse.json(
    {
      section: content.section,
      data: content.data,
      updated_at: content.updatedAt.toISOString(),
    },
    { headers: CACHE_HEADERS }
  )
}

export async function POST(request: NextRequest) {
  if (ADMIN_SECRET) {
    const headerSecret = request.headers.get("x-content-admin-secret")
    if (headerSecret !== ADMIN_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { section, locale, data } = body

  if (!section || data === undefined) {
    return NextResponse.json({ message: "section and data are required" }, { status: 400 })
  }

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
    return NextResponse.json({
      item: {
        section: item.section,
        locale: item.locale,
        data: item.data,
        updated_at: item.updatedAt.toISOString(),
      },
    })
  }

  const item = await prisma.siteContent.upsert({
    where: { section },
    update: { data },
    create: { section, data },
  })

  return NextResponse.json({
    item: {
      section: item.section,
      data: item.data,
      updated_at: item.updatedAt.toISOString(),
    },
  })
}
