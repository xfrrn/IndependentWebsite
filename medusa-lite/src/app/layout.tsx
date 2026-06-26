import { getBaseURL } from "@lib/util/env"
import { getLocale } from "@lib/data/locale-actions"
import { getLocaleDirection, normalizeLocale } from "@lib/data/supported-locales"
import { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = normalizeLocale(await getLocale())

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      data-mode="light"
      suppressHydrationWarning
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
