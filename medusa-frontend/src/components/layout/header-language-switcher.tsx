"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { updateLocale } from "@lib/data/locale-actions"
import type { Locale } from "@lib/data/locales"

type HeaderLanguageSwitcherProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

const FALLBACK_LOCALES: Locale[] = [
  { code: "en-US", name: "English" },
  { code: "zh-CN", name: "简体中文" },
]

function getLanguageLabel(
  code: string,
  fallback: string,
  displayLocale: string | null
) {
  try {
    const names = new Intl.DisplayNames([displayLocale || code || "en-US"], {
      type: "language",
    })

    return names.of(code) ?? fallback
  } catch {
    return fallback
  }
}

export default function HeaderLanguageSwitcher({
  locales,
  currentLocale,
}: HeaderLanguageSwitcherProps) {
  const router = useRouter()
  const [selectedLocale, setSelectedLocale] = useState(currentLocale || "en-US")
  const [isPending, startTransition] = useTransition()

  const options = useMemo(() => {
    const availableLocales = locales?.length ? locales : FALLBACK_LOCALES

    return availableLocales.map((locale) => ({
      ...locale,
      label: getLanguageLabel(locale.code, locale.name, currentLocale),
    }))
  }, [currentLocale, locales])

  useEffect(() => {
    setSelectedLocale(currentLocale || "en-US")
  }, [currentLocale])

  const handleChange = (localeCode: string) => {
    setSelectedLocale(localeCode)

    startTransition(async () => {
      await updateLocale(localeCode)
      router.refresh()
    })
  }
  const languageLabel = selectedLocale.toLowerCase().startsWith("zh")
    ? "语言"
    : "Language"

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--text-body)]">
      <span className="whitespace-nowrap text-[10px] font-semibold text-[color:var(--text-muted)]">
        {languageLabel}
      </span>
      <select
        aria-label="Language"
        className="h-9 rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-card)] px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-strong)] transition duration-200 ease-out hover:border-[color:var(--accent)] focus:border-[color:var(--accent)] focus:outline-none disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        value={selectedLocale || "en-US"}
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
