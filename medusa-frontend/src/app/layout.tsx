import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Nunito_Sans } from "next/font/google"
import "styles/globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className={nunitoSans.variable}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
