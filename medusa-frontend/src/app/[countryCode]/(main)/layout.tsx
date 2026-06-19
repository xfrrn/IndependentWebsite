import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Footer from "@modules/layout/templates/footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      {props.children}
      <Footer />
    </>
  )
}
