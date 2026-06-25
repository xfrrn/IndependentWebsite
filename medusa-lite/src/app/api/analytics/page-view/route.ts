import { NextRequest, NextResponse } from "next/server"
import { recordPageView } from "@/lib/analytics"

export const dynamic = "force-dynamic"

const EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/_next",
  "/content-manager",
]

function isTrackablePath(path: string) {
  if (
    !path ||
    path.length > 500 ||
    path.includes(".") ||
    path.includes("/content-manager")
  ) {
    return false
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      path?: unknown
      title?: unknown
      referrer?: unknown
    }

    const path = typeof body.path === "string" ? body.path.trim() : ""

    if (!isTrackablePath(path)) {
      return NextResponse.json({ ok: true })
    }

    await recordPageView({
      path,
      title: typeof body.title === "string" ? body.title.slice(0, 300) : null,
      referrer:
        typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip"),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to record page view", error)
    return NextResponse.json({ ok: true })
  }
}
