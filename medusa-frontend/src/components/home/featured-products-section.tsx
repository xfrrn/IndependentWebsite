import { FEATURED_PRODUCTS } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import ProductsRow from "./products-row"

export default async function FeaturedProductsSection({
  countryCode,
  currentLocale,
}: {
  countryCode: string
  currentLocale: string | null
}) {
  const content = await getLocalizedHomeContentSection(
    "featured_products",
    FEATURED_PRODUCTS,
    currentLocale
  )

  return (
    <ProductsRow
      countryCode={countryCode}
      currentLocale={currentLocale}
      title={content.eyebrow}
      subtitle={content.title}
      description={content.subtitle}
      strategy={content.strategy}
    />
  )
}
