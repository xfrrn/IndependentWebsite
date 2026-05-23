import MainHeader from "../../../components/layout/main-header"
import PrimaryNav from "../../../components/layout/primary-nav"
import AgeShopGrid from "../../../components/home/age-shop-grid"
import CategoryHighlights from "../../../components/home/category-highlights"
import FeaturedProductsSection from "../../../components/home/featured-products-section"
import HeroIntro from "../../../components/home/hero-intro"
import { HEADER_CONTENT, NAV_CONTENT } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const [params, headerContent, navContent] = await Promise.all([
    props.params,
    getSiteContentSection("header_content", HEADER_CONTENT),
    getSiteContentSection("nav_content", NAV_CONTENT),
  ])

  return (
    <div className="bg-[var(--bg-canvas)]">
      <div className="sticky top-0 z-50">
        <MainHeader content={headerContent} />
        <PrimaryNav content={navContent} />
      </div>

      <main>
        <HeroIntro />
        <FeaturedProductsSection countryCode={params.countryCode} />
        <CategoryHighlights />
        <AgeShopGrid />
      </main>
    </div>
  )
}
