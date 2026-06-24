"use client"

import Link from "next/link"

export default function HomeLink({
  currentLocale,
}: {
  currentLocale: string | null
}) {
  const isChinese = currentLocale?.toLowerCase().startsWith("zh") ?? false

  return (
    <Link
      href="/"
      className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-body)] hover:border-[color:var(--accent)]"
    >
      {isChinese ? "首页" : "Home"}
    </Link>
  )
}
