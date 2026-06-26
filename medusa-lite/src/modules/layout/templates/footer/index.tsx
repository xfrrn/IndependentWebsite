import { Text } from "@medusajs/ui"
import {
  CONTACT_IMAGES_CONTENT,
  FOOTER_CONTENT,
  type ContactImagesContent,
} from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import { normalizeLocale } from "@lib/data/supported-locales"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FooterSocialLinks from "./footer-social-links"

type FooterSocialLink = {
  label: string
  href: string
  modalImageSrc?: string
  modalImageAlt?: string
}

function getContactImageKey(link: { href?: string; label?: string }) {
  const value = `${link.href || ""} ${link.label || ""}`.toLowerCase()

  if (value.includes("wechat") || value.includes("微信")) {
    return "wechat" as const
  }

  if (value.includes("whatsapp")) {
    return "whatsapp" as const
  }

  return null
}

function applySharedContactImages(
  links: FooterSocialLink[],
  contactImages: ContactImagesContent
) {
  return links.map((link) => {
    const key = getContactImageKey(link)
    const image = key ? contactImages[key] : null

    if (!image?.src) {
      return link
    }

    return {
      ...link,
      href: `#${key}`,
      modalImageSrc: image.src,
      modalImageAlt: image.alt || link.modalImageAlt || link.label,
    }
  })
}

export default async function Footer() {
  // ponytail: keep public pages cacheable; use URL locale later if SSR footer language matters.
  const currentLocale = normalizeLocale()
  const [content, contactImages] = await Promise.all([
    getLocalizedHomeContentSection(
      "footer_content",
      FOOTER_CONTENT,
      currentLocale
    ),
    getSiteContentSection<ContactImagesContent>(
      "contact_images",
      CONTACT_IMAGES_CONTENT
    ),
  ])
  const socialLinks = applySharedContactImages(
    content.socialLinks,
    contactImages
  )
  const rightsLabel = currentLocale?.toLowerCase().startsWith("zh")
    ? "版权所有。"
    : "All rights reserved."

  return (
    <footer className="w-full border-t border-[color:var(--border-soft)] bg-[var(--bg-surface)]">
      <div className="content-container flex w-full flex-col">
        <div className="flex flex-col items-center py-24 text-center">
          <LocalizedClientLink
            href="/"
            className="text-3xl font-semibold uppercase tracking-[0.18em] text-[color:var(--text-strong)] ui-link"
          >
            {content.brandName}
          </LocalizedClientLink>

          <div className="mt-10 flex flex-col items-center gap-3 text-3xl font-medium text-[color:var(--text-strong)] md:text-4xl">
            <a href={content.websiteHref} className="ui-link">
              {content.websiteLabel}
            </a>
            <a href={content.contactHref} className="ui-link">
              {content.contactLabel}
            </a>
          </div>

          <FooterSocialLinks links={socialLinks} />
        </div>

        <div className="mb-16 flex w-full items-center justify-center text-[color:var(--text-muted)]">
          <Text className="txt-compact-small">
            (c) {new Date().getFullYear()} {content.brandName}. {rightsLabel}
          </Text>
        </div>
      </div>
    </footer>
  )
}
