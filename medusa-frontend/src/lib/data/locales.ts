"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"
import { SUPPORTED_LOCALES } from "./supported-locales"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  const next = {
    ...(await getCacheOptions("locales")),
  }

  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ locales }) => {
      const supportedCodes = new Set(SUPPORTED_LOCALES.map((item) => item.code))
      const backendLocales = locales.filter((locale) =>
        supportedCodes.has(locale.code)
      )
      const backendCodes = new Set(backendLocales.map((locale) => locale.code))
      const missingLocales = SUPPORTED_LOCALES.filter(
        (locale) => !backendCodes.has(locale.code)
      )

      return [...backendLocales, ...missingLocales]
    })
    .catch(() => [...SUPPORTED_LOCALES])
}
