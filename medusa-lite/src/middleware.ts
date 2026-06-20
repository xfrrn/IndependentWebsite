import { NextRequest, NextResponse } from "next/server"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

const REMOVED_COMMERCE_SEGMENTS = new Set([
  "account",
  "cart",
  "checkout",
  "order",
])

const regionMapCache = {
  regionMap: new Map<string, any>(),
  regionMapUpdated: 0,
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const res = await fetch(`${APP_URL}/api/regions`, {
      next: { revalidate: 3600, tags: [`regions-${cacheId}`] },
      cache: "force-cache",
    })

    const { regions } = await res.json()

    if (!regions?.length) {
      throw new Error("No regions found. Please seed the database.")
    }

    regions.forEach((region: any) => {
      region.countries?.forEach((c: any) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, any>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch {
    return undefined
  }
}

export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const pathSegments = request.nextUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase())

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1] === countryCode

  const firstContentSegment = urlHasCountryCode ? pathSegments[1] : pathSegments[0]

  if (
    countryCode &&
    firstContentSegment &&
    REMOVED_COMMERCE_SEGMENTS.has(firstContentSegment)
  ) {
    const response = NextResponse.redirect(
      `${request.nextUrl.origin}/${countryCode}/products`,
      307
    )
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  if (urlHasCountryCode && !cacheIdCookie) {
    response = NextResponse.next()
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    return new NextResponse(
      "No valid regions configured. Please run the seed script first.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
