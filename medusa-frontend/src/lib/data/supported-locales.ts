export const SUPPORTED_LOCALES = [
  { code: "en-US", name: "English", label: "English", dir: "ltr" },
  { code: "ar-SA", name: "Arabic", label: "العربية", dir: "rtl" },
  { code: "zh-CN", name: "Chinese", label: "中文", dir: "ltr" },
] as const

export type SupportedLocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"]

export function isSupportedLocale(
  locale?: string | null
): locale is SupportedLocaleCode {
  return SUPPORTED_LOCALES.some((item) => item.code === locale)
}

export function normalizeLocale(locale?: string | null): SupportedLocaleCode {
  return isSupportedLocale(locale) ? locale : "en-US"
}

export function getLocaleDirection(locale?: string | null) {
  return SUPPORTED_LOCALES.find((item) => item.code === locale)?.dir ?? "ltr"
}
