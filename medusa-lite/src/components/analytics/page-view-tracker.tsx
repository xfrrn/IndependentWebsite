"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/_next",
  "/content-manager",
]

function shouldTrack(path: string) {
  if (!path || path.includes(".") || path.includes("/content-manager")) {
    return false
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || !shouldTrack(pathname)) {
      return
    }

    const query = searchParams.toString()
    const path = query ? `${pathname}?${query}` : pathname
    const body = JSON.stringify({
      path,
      title: document.title,
      referrer: document.referrer,
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/page-view",
        new Blob([body], { type: "application/json" })
      )
      return
    }

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname, searchParams])

  return null
}
