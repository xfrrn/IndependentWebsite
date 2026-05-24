import MainHeader from "../../../components/layout/main-header"
import PrimaryNav from "../../../components/layout/primary-nav"
import AgeShopGrid from "../../../components/home/age-shop-grid"
import CategoryHighlights from "../../../components/home/category-highlights"
import FeaturedProductsSection from "../../../components/home/featured-products-section"
import HeroIntro from "../../../components/home/hero-intro"
import { HEADER_CONTENT, NAV_CONTENT } from "@lib/data/homepage"
import { getLocale } from "@lib/data/locale-actions"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { listLocales } from "@lib/data/locales"

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const [params, locales, currentLocale] = await Promise.all([
    props.params,
    listLocales(),
    getLocale(),
  ])
  const [headerContent, navContent] = await Promise.all([
    getLocalizedHomeContentSection(
      "header_content",
      HEADER_CONTENT,
      currentLocale
    ),
    getLocalizedHomeContentSection("nav_content", NAV_CONTENT, currentLocale),
  ])

  return (
    <div className="bg-[var(--bg-canvas)]">
      <div className="sticky top-0 z-50">
        <MainHeader
          content={headerContent}
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
