"use server"
import { cookies as nextCookies } from "next/headers"
import { normalizeLocale } from "./supported-locales"

const LOCALE_COOKIE_NAME = "_medusa_locale"

export const getLocale = async (): Promise<string | null> => {
  try {
    const cookies = await nextCookies()
    return normalizeLocale(cookies.get(LOCALE_COOKIE_NAME)?.value)
  } catch {
    return "en-US"
  }
}

export const setLocaleCookie = async (locale: string) => {
  const cookies = await nextCookies()
  cookies.set(LOCALE_COOKIE_NAME, normalizeLocale(locale), {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const updateLocale = async (localeCode: string): Promise<string> => {
  const normalizedLocale = normalizeLocale(localeCode)
  await setLocaleCookie(normalizedLocale)
  return normalizedLocale
}
