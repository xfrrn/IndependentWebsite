"use server"
import { cookies as nextCookies } from "next/headers"
import { normalizeLocale } from "./supported-locales"

const LOCALE_COOKIE_NAME = "_medusa_locale"

/**
 * Gets the current locale from cookies
 */
export const getLocale = async (): Promise<string | null> => {
  try {
    const cookies = await nextCookies()
    return normalizeLocale(cookies.get(LOCALE_COOKIE_NAME)?.value)
  } catch {
    return "en-US"
  }
}

/**
 * Sets the locale cookie
 */
export const setLocaleCookie = async (locale: string) => {
  const cookies = await nextCookies()
  cookies.set(LOCALE_COOKIE_NAME, normalizeLocale(locale), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Updates the locale preference via SDK and stores in cookie.
 */
export const updateLocale = async (localeCode: string): Promise<string> => {
  const normalizedLocale = normalizeLocale(localeCode)

  await setLocaleCookie(normalizedLocale)

  return normalizedLocale
}
