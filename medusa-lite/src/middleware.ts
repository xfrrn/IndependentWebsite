import { NextRequest, NextResponse } from "next/server"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

const REMOVED_COMMERCE_SEGMENTS = new Set([
  "account",
  "cart",
  "checkout",
  "order",
])

const CLEAN_URL_SEGMENTS = new Set(["shop"])

type Region = {
  countries?: Array<{ iso_2?: string | null }>
}

const regionMapCache = {
  regionMap: new Map<string, Region>(),
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

    const { regions } = (await res.json()) as { regions?: Region[] }

    if (!regions?.length) {
      throw new Error("No regions found. Please seed the database.")
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, Region>
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
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch {
    return undefined
  }
}

export async function middleware(request: NextRequest) {
  const isAdminPage =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/")
  const isAdminApi =
    request.nextUrl.pathname === "/api/admin" ||
    request.nextUrl.pathname.startsWith("/api/admin/")
  const isAdminLogin = request.nextUrl.pathname === "/admin/login"

  if (isAdminPage || isAdminApi) {
    const isAuthed = await isAdminSessionToken(
      request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    )

    if (isAdminLogin) {
      return isAuthed
        ? NextResponse.redirect(new URL("/admin", request.url), 307)
        : NextResponse.next()
    }

    if (!isAuthed) {
      if (isAdminApi) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }

      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search
      )
      return NextResponse.redirect(loginUrl, 307)
    }

    return NextResponse.next()
  }

  let response = NextResponse.next()

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const pathSegments = request.nextUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase())

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1] === countryCode

  const firstContentSegment = urlHasCountryCode ? pathSegments[1] : pathSegments[0]
  const contentSegments = urlHasCountryCode ? pathSegments.slice(1) : pathSegments

  if (contentSegments[0] === "store") {
    const response = NextResponse.redirect(new URL("/products", request.url), 307)
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (contentSegments[0] === "categories" && contentSegments[1]) {
    const response = NextResponse.redirect(
      new URL(`/shop/category/${contentSegments.slice(1).join("/")}`, request.url),
      307
    )
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (
    countryCode &&
    firstContentSegment &&
    REMOVED_COMMERCE_SEGMENTS.has(firstContentSegment)
  ) {
    const response = NextResponse.redirect(
      new URL("/products", request.url),
      307
    )
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  if (urlHasCountryCode) {
    const strippedPath = `/${pathSegments.slice(1).join("/")}`
    const cleanUrl = new URL(
      strippedPath === "/" ? "/" : strippedPath,
      request.url
    )
    cleanUrl.search = request.nextUrl.search
    response = NextResponse.redirect(cleanUrl, 307)
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  if (firstContentSegment && CLEAN_URL_SEGMENTS.has(firstContentSegment)) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (countryCode) {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = `/${countryCode}${request.nextUrl.pathname}`
    response = NextResponse.rewrite(rewriteUrl)
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  } else {
    return new NextResponse(
      "No valid regions configured. Please run the seed script first.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
