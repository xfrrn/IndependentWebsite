export const DEFAULT_LANGUAGE = "en"
export const LANGUAGE_STORAGE_KEY = "lng"

export const languages = [
  { code: "bs", label: "Bosnian", nativeName: "Bosanski", ltr: true },
  { code: "bg", label: "Bulgarian", nativeName: "Български", ltr: true },
  { code: "en", label: "English", nativeName: "English", ltr: true },
  { code: "es", label: "Spanish", nativeName: "Español", ltr: true },
  { code: "el", label: "Greek", nativeName: "Ελληνικά", ltr: true },
  { code: "de", label: "German", nativeName: "Deutsch", ltr: true },
  { code: "fr", label: "French", nativeName: "Français", ltr: true },
  { code: "he", label: "Hebrew", nativeName: "עברית", ltr: false },
  { code: "hu", label: "Hungarian", nativeName: "Magyar", ltr: true },
  { code: "it", label: "Italian", nativeName: "Italiano", ltr: true },
  { code: "ja", label: "Japanese", nativeName: "日本語", ltr: true },
  { code: "pl", label: "Polish", nativeName: "Polski", ltr: true },
  { code: "ptBR", label: "Portuguese (Brazil)", nativeName: "Português (Brasil)", ltr: true },
  { code: "ptPT", label: "Portuguese (Portugal)", nativeName: "Português (Portugal)", ltr: true },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", ltr: true },
  { code: "th", label: "Thai", nativeName: "ไทย", ltr: true },
  { code: "uk", label: "Ukrainian", nativeName: "Українська", ltr: true },
  { code: "ro", label: "Romanian", nativeName: "Română", ltr: true },
  { code: "mk", label: "Macedonian", nativeName: "Македонски", ltr: true },
  { code: "mn", label: "Mongolian", nativeName: "Монгол", ltr: true },
  { code: "ar", label: "Arabic", nativeName: "العربية", ltr: false },
  { code: "zhCN", label: "Chinese (Simplified)", nativeName: "简体中文", ltr: true },
  { code: "fa", label: "Persian", nativeName: "فارسی", ltr: false },
  { code: "cs", label: "Czech", nativeName: "Čeština", ltr: true },
  { code: "ru", label: "Russian", nativeName: "Русский", ltr: true },
  { code: "lt", label: "Lithuanian", nativeName: "Lietuviškai", ltr: true },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", ltr: true },
  { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia", ltr: true },
  { code: "ko", label: "Korean", nativeName: "한국어", ltr: true },
  { code: "nl", label: "Dutch", nativeName: "Nederlands", ltr: true },
  { code: "zhTW", label: "Chinese (Traditional)", nativeName: "繁體中文(臺灣)", ltr: true },
] as const

export type LanguageCode = (typeof languages)[number]["code"]

export function isSupportedLanguage(
  language: string | null | undefined
): language is LanguageCode {
  return languages.some((supportedLanguage) => supportedLanguage.code === language)
}

export function getLanguage(language: string | null | undefined) {
  return languages.find((supportedLanguage) => supportedLanguage.code === language)
}

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    if (isSupportedLanguage(storedLanguage)) {
      return storedLanguage
    }
  } catch {
    return DEFAULT_LANGUAGE
  }

  return DEFAULT_LANGUAGE
}

export function persistLanguage(language: LanguageCode): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Ignore storage failures so cookie persistence can still proceed.
  }

  document.cookie = `${LANGUAGE_STORAGE_KEY}=${language};path=/;max-age=31536000;samesite=lax`
}
