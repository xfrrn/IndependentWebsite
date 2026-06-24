import { getBaseURL } from "@lib/util/env"
import { getLocale } from "@lib/data/locale-actions"
import { getLocaleDirection, normalizeLocale } from "@lib/data/supported-locales"
import { Metadata } from "next"
import { Nunito_Sans } from "next/font/google"
import "../styles/globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

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
      <body className={nunitoSans.variable}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
