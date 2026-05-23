"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function getCountryCode(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] || "us"
}

export default function HomeLink() {
  const pathname = usePathname()
  const countryCode = getCountryCode(pathname)

  return (
    <Link
      href={`/${countryCode}`}
      className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
    >
      Home
    </Link>
  )
}
