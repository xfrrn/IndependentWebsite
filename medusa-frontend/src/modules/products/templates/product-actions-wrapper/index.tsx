import { listProducts } from "@lib/data/products"
import { getSiteContentSection } from "@lib/data/site-content"
import { PRODUCT_UI_CONTENT } from "@lib/data/homepage"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, content] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    getSiteContentSection("product_ui_content", PRODUCT_UI_CONTENT),
  ])

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} content={content} />
}
