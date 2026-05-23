"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import HomeLink from "./home-link"

type HeaderContent = {
  brandName: string
  searchAriaLabel: string
  searchPlaceholder: string
  mobileMenuLabel: string
  links: {
    label: string
    detail: string
    href: string
  }[]
}

function getCountryCode(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] || "us"
}

export default function MainHeader({ content }: { content: HeaderContent }) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const countryCode = getCountryCode(pathname)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/${countryCode}/products?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="bg-[var(--bg-surface)]">
      <div className="content-container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between md:w-[220px]">
          <div className="text-lg font-semibold tracking-[0.2em] text-[color:var(--text-strong)]">
            {content.brandName}
          </div>
          <div className="flex items-center gap-2">
            <HomeLink />
            <button
              className="rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-card)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--text-body)] md:hidden"
              type="button"
            >
              {content.mobileMenuLabel}
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.88)] px-4 py-2 shadow-[0_10px_30px_-22px_rgba(85,63,39,0.14)] transition duration-300 ease-out focus-within:border-[color:var(--accent)] focus-within:shadow-[0_16px_34px_-24px_rgba(78,139,87,0.28)]"
        >
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white transition duration-300 ease-out hover:bg-[color:var(--accent-strong)]"
            type="submit"
            aria-label={content.searchAriaLabel}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
          <input
            className="w-full bg-transparent text-sm text-[color:var(--text-strong)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={content.searchPlaceholder}
          />
        </form>

        <div className="hidden items-center justify-end gap-6 text-xs text-[color:var(--text-body)] md:flex">
          {content.links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-end ui-link ${item.href === "#" ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="uppercase tracking-[0.2em] text-[10px]">
                {item.label}
              </span>
              <span className="text-sm text-black/80">{item.detail}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-black/60 md:hidden">
          {content.links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm uppercase tracking-[0.18em] text-black/80 ${item.href === "#" ? "pointer-events-none opacity-50" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
