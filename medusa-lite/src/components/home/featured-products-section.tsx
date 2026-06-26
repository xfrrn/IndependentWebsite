import { FEATURED_PRODUCTS } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import ProductsRow from "./products-row"

type FeaturedProductsContent = typeof FEATURED_PRODUCTS & {
  showProductNames?: boolean
  showProductPrices?: boolean
}

export default async function FeaturedProductsSection({
  countryCode,
  currentLocale,
}: {
  countryCode: string
  currentLocale: string | null
}) {
  const content = await getLocalizedHomeContentSection<FeaturedProductsContent>(
    "featured_products",
    FEATURED_PRODUCTS,
    currentLocale
  )

  return (
    <ProductsRow
      countryCode={countryCode}
      title={content.eyebrow}
      subtitle={content.title}
      description={content.subtitle}
      strategy={content.strategy}
      showProductNames={content.showProductNames ?? FEATURED_PRODUCTS.showProductNames}
      showProductPrices={content.showProductPrices ?? FEATURED_PRODUCTS.showProductPrices}
      currentLocale={currentLocale}
    />
  )
}
