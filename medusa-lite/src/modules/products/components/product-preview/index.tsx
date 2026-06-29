import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { getLocalizedProductTitle } from "@lib/util/localized-product-title"
import { StoreProduct, StoreRegion } from "@/lib/types"
import Link from "next/link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
  showTitle = true,
  showPrice = true,
  currentLocale,
}: {
  product: StoreProduct
  isFeatured?: boolean
  region: StoreRegion
  showTitle?: boolean
  showPrice?: boolean
  currentLocale?: string | null
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = showPrice
    ? getProductPrice({
        product,
      })
    : { cheapestPrice: null }
  const productTitle = getLocalizedProductTitle(
    product,
    currentLocale
  )

  return (
    <Link
      href={`/products/${product.handle}`}
      prefetch={false}
      className="group block min-w-0 ui-link ui-focus"
    >
      <div data-testid="product-wrapper" className="relative min-w-0">
        <div className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(232,241,228,0.95)_0%,rgba(232,241,228,0)_72%)] opacity-0 blur-xl transition duration-300 ease-out group-hover:opacity-100" />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        {showTitle || showPrice ? (
          <div className="mt-4 flex min-w-0 flex-col gap-2 txt-compact-medium sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            {showTitle ? (
              <Text
                className="min-w-0 break-words text-[15px] font-semibold leading-6 text-[color:var(--text-strong)] transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
                data-testid="product-title"
              >
                {productTitle}
              </Text>
            ) : null}
            {showPrice ? (
              <div className="flex shrink-0 items-center gap-x-2">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
