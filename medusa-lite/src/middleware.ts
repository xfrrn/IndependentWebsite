import { NextRequest, NextResponse } from "next/server"
import { ADMIN_AUTH_COOKIE, isAdminSessionToken } from "@/lib/admin-auth"

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "gb"

const REMOVED_COMMERCE_SEGMENTS = new Set([
  "account",
  "cart",
  "checkout",
  "order",
])

const CLEAN_URL_SEGMENTS = new Set(["shop"])

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

  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const pathSegments = request.nextUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase())
  const firstSegment = pathSegments[0]

  if (/^[a-z]{2}$/.test(firstSegment || "")) {
    const cleanPath = `/${pathSegments.slice(1).join("/")}`
    const cleanUrl = new URL(cleanPath === "/" ? "/" : cleanPath, request.url)
    cleanUrl.search = request.nextUrl.search
    return NextResponse.redirect(cleanUrl, 307)
  }

  if (firstSegment === "store") {
    return NextResponse.redirect(new URL("/products", request.url), 307)
  }

  if (firstSegment === "categories" && pathSegments[1]) {
    return NextResponse.redirect(
      new URL(`/shop/category/${pathSegments.slice(1).join("/")}`, request.url),
      307
    )
  }

  if (firstSegment && REMOVED_COMMERCE_SEGMENTS.has(firstSegment)) {
    return NextResponse.redirect(new URL("/products", request.url), 307)
  }

  if (firstSegment && CLEAN_URL_SEGMENTS.has(firstSegment)) {
    return NextResponse.next()
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `/${DEFAULT_COUNTRY_CODE}${request.nextUrl.pathname}`
  return NextResponse.rewrite(rewriteUrl)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
