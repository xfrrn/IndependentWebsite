import { FEATURED_PRODUCTS } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import ProductsRow from "./products-row"

export default async function FeaturedProductsSection({
  countryCode,
}: {
  countryCode: string
}) {
  const content = await getSiteContentSection("featured_products", FEATURED_PRODUCTS)

  return (
    <ProductsRow
      countryCode={countryCode}
      title={content.eyebrow}
      subtitle={content.title}
      description={content.subtitle}
      strategy={content.strategy}
    />
  )
}
