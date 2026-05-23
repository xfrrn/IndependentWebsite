import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block ui-link ui-focus"
    >
      <div data-testid="product-wrapper" className="relative">
        <div className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(232,241,228,0.95)_0%,rgba(232,241,228,0)_72%)] opacity-0 blur-xl transition duration-300 ease-out group-hover:opacity-100" />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="mt-4 flex items-start justify-between gap-3 txt-compact-medium">
          <Text
            className="text-ui-fg-subtle text-[15px] font-semibold leading-6 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent-strong)]"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
