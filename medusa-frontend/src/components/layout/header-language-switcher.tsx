"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import type { Locale } from "@lib/data/locales"
import { normalizeLocale, SUPPORTED_LOCALES } from "@lib/data/supported-locales"

type HeaderLanguageSwitcherProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

const LOCALE_COOKIE_NAME = "_medusa_locale"

export default function HeaderLanguageSwitcher({
  locales,
  currentLocale,
}: HeaderLanguageSwitcherProps) {
  const router = useRouter()
  const [selectedLocale, setSelectedLocale] = useState(
    normalizeLocale(currentLocale)
  )
  const [isPending, startTransition] = useTransition()

  const options = useMemo(() => {
    const availableByCode = new Map(
      (locales ?? []).map((locale) => [locale.code, locale])
    )

    return SUPPORTED_LOCALES.map((locale) => ({
      ...locale,
      name: availableByCode.get(locale.code)?.name ?? locale.name,
    }))
  }, [locales])

  useEffect(() => {
    setSelectedLocale(normalizeLocale(currentLocale))
  }, [currentLocale])

  const handleChange = (localeCode: string) => {
    const nextLocale = normalizeLocale(localeCode)
    setSelectedLocale(nextLocale)

    startTransition(() => {
      document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(
        nextLocale
      )}; path=/; max-age=31536000; samesite=strict`
      router.refresh()
    })
  }

  const languageLabel = selectedLocale === "ar-SA" ? "اللغة" : "Language"

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--text-body)]">
      <span className="whitespace-nowrap text-[10px] font-semibold text-[color:var(--text-muted)]">
        {languageLabel}
      </span>
      <select
        aria-label="Language"
        className="h-9 rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-card)] px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-strong)] transition duration-200 ease-out hover:border-[color:var(--accent)] focus:border-[color:var(--accent)] focus:outline-none disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        value={selectedLocale}
        onChange={(event) => handleChange(event.target.value)}
      >
        {options.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </label>
  )
}
