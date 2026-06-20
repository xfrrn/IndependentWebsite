"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import type { Locale } from "@lib/data/locales"
import HomeLink from "./home-link"
import HeaderLanguageSwitcher from "./header-language-switcher"

type HeaderContent = {
  brandName: string
  searchAriaLabel: string
  searchPlaceholder: string
  mobileMenuLabel: string
  links: {
    label: string
    detail: string
    href: string
    modalImageSrc?: string
    modalImageAlt?: string
  }[]
}

type ContactModal = {
  label: string
  detail: string
  imageSrc: string
  imageAlt: string
}

function getCountryCode(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] || "us"
}

export default function MainHeader({
  content,
  locales,
  currentLocale,
}: {
  content: HeaderContent
  locales: Locale[] | null
  currentLocale: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [contactModal, setContactModal] = useState<ContactModal | null>(null)
  const countryCode = getCountryCode(pathname)

  useEffect(() => {
    if (!contactModal) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContactModal(null)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [contactModal])

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
            <HomeLink currentLocale={currentLocale} />
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
          className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[rgba(20,18,15,0.88)] px-4 py-2 shadow-[0_18px_38px_-28px_rgba(0,0,0,0.9)] transition duration-300 ease-out focus-within:border-[color:var(--accent)] focus-within:shadow-[0_18px_42px_-28px_rgba(212,175,55,0.34)]"
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

        <div className="hidden items-center justify-end gap-5 text-xs text-[color:var(--text-body)] md:flex">
          {content.links.map((item) =>
            item.modalImageSrc ? (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  setContactModal({
                    label: item.label,
                    detail: item.detail,
                    imageSrc: item.modalImageSrc as string,
                    imageAlt: item.modalImageAlt || item.label,
                  })
                }
                className="flex flex-col items-end text-right ui-link"
              >
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  {item.label}
                </span>
                <span className="text-sm text-[color:var(--text-body)]">{item.detail}</span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-end ui-link ${item.href === "#" ? "pointer-events-none opacity-50" : ""}`}
              >
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  {item.label}
                </span>
                <span className="text-sm text-[color:var(--text-body)]">{item.detail}</span>
              </Link>
            )
          )}
          <HeaderLanguageSwitcher
            locales={locales}
            currentLocale={currentLocale}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--text-body)] md:hidden">
          <div className="flex flex-wrap items-center gap-4">
            {content.links.map((item) =>
              item.modalImageSrc ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    setContactModal({
                      label: item.label,
                      detail: item.detail,
                      imageSrc: item.modalImageSrc as string,
                      imageAlt: item.modalImageAlt || item.label,
                    })
                  }
                  className="text-sm uppercase tracking-[0.18em] text-[color:var(--text-body)] ui-link"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm uppercase tracking-[0.18em] text-[color:var(--text-body)] ${item.href === "#" ? "pointer-events-none opacity-50" : ""}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
          <HeaderLanguageSwitcher
            locales={locales}
            currentLocale={currentLocale}
          />
        </div>
      </div>

      {contactModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={contactModal.label}
          onClick={() => setContactModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-[1rem] bg-[var(--bg-surface)] p-4 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  {contactModal.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--text-strong)]">
                  {contactModal.detail}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-soft)] text-xl leading-none text-[color:var(--text-body)] transition hover:bg-[var(--bg-card)]"
                onClick={() => setContactModal(null)}
                aria-label="Close contact QR code"
              >
                X
              </button>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[0.75rem] bg-white">
              <Image
                src={contactModal.imageSrc}
                alt={contactModal.imageAlt}
                fill
                sizes="(min-width: 768px) 360px, calc(100vw - 64px)"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
