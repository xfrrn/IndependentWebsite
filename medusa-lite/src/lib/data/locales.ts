"use server"

import { SUPPORTED_LOCALES } from "./supported-locales"

export type Locale = { code: string; name: string }

export const listLocales = async (): Promise<Locale[] | null> => {
  return [...SUPPORTED_LOCALES]
}
