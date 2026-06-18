import MainHeader from "../../../components/layout/main-header"
import PrimaryNav from "../../../components/layout/primary-nav"
import AgeShopGrid from "../../../components/home/age-shop-grid"
import CategoryHighlights from "../../../components/home/category-highlights"
import FeaturedProductsSection from "../../../components/home/featured-products-section"
import HeroIntro from "../../../components/home/hero-intro"
import {
  CONTACT_IMAGES_CONTENT,
  HEADER_CONTENT,
  NAV_CONTENT,
  type ContactImagesContent,
} from "@lib/data/homepage"
import { getLocale } from "@lib/data/locale-actions"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { listLocales } from "@lib/data/locales"
import { getSiteContentSection } from "@lib/data/site-content"

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

function applySharedContactImages<T extends typeof HEADER_CONTENT>(
  headerContent: T,
  contactImages: ContactImagesContent
): T {
  return {
    ...headerContent,
    links: headerContent.links.map((link) => {
      const key = getContactImageKey(link)
      const image = key ? contactImages[key] : null

      if (!image?.src) {
        return link
      }

      return {
        ...link,
        modalImageSrc: image.src,
        modalImageAlt: image.alt || link.modalImageAlt,
      }
    }),
  } as T
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const [params, locales, currentLocale] = await Promise.all([
    props.params,
    listLocales(),
    getLocale(),
  ])
  const [headerContent, navContent, contactImages] = await Promise.all([
    getLocalizedHomeContentSection(
      "header_content",
      HEADER_CONTENT,
      currentLocale
    ),
    getLocalizedHomeContentSection("nav_content", NAV_CONTENT, currentLocale),
    getSiteContentSection<ContactImagesContent>(
      "contact_images",
      CONTACT_IMAGES_CONTENT
    ),
  ])
  const headerContentWithSharedImages = applySharedContactImages(
    headerContent,
    contactImages
  )

  return (
    <div className="bg-[var(--bg-canvas)]">
      <div className="sticky top-0 z-50">
        <MainHeader
          content={headerContentWithSharedImages}
          locales={locales}
          currentLocale={currentLocale}
        />
        <PrimaryNav content={navContent} />
      </div>

      <main>
        <HeroIntro currentLocale={currentLocale} />
        <FeaturedProductsSection
          countryCode={params.countryCode}
          currentLocale={currentLocale}
        />
        <CategoryHighlights currentLocale={currentLocale} />
        <AgeShopGrid currentLocale={currentLocale} />
      </main>
    </div>
  )
}
