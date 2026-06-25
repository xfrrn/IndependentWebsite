import { listProducts } from "@lib/data/products"
import { getLocale } from "@lib/data/locale-actions"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { PRODUCT_UI_CONTENT } from "@lib/data/homepage"
import { getLocalizedProductTitle } from "@lib/util/localized-product-title"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  product: passedProduct,
  region,
}: {
  id?: string
  product?: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  if (!passedProduct && !id) {
    return null
  }

  const locale = await getLocale()
  const [product, content] = await Promise.all([
    passedProduct ??
      listProducts({
        queryParams: { id: [id] },
        regionId: region.id,
      }).then(({ response }) => response.products[0]),
    getLocalizedHomeContentSection("product_ui_content", PRODUCT_UI_CONTENT, locale),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      content={content}
      productTitle={getLocalizedProductTitle(product, locale)}
    />
  )
}
