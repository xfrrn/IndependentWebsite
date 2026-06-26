"use server"

import { getCacheOptions } from "./cookies"
import { SUPPORTED_LOCALES } from "./supported-locales"
import { getInternalBaseURL } from "@lib/util/env"

const API_BASE = getInternalBaseURL()

export type Locale = { code: string; name: string }

export const listLocales = async (): Promise<Locale[] | null> => {
  const next = { ...(await getCacheOptions("locales")) }

  return fetch(`${API_BASE}/api/locales`, {
    method: "GET",
    next,
    cache: "force-cache",
  })
    .then((res) => res.json())
    .then(({ locales }) => {
      const supportedCodes = new Set(SUPPORTED_LOCALES.map((item) => item.code))
      const backendLocales = locales.filter((locale: Locale) => supportedCodes.has(locale.code))
      const backendCodes = new Set(backendLocales.map((l: Locale) => l.code))
      const missingLocales = SUPPORTED_LOCALES.filter((l) => !backendCodes.has(l.code))
      return [...backendLocales, ...missingLocales]
    })
    .catch(() => [...SUPPORTED_LOCALES])
}
