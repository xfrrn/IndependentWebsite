"use client"

import Link from "next/link"
import React from "react"

type LocalizedClientLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "href"
> & {
  href: string
}

const LocalizedClientLink = ({
  children,
  href,
  ...props
}: LocalizedClientLinkProps) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
