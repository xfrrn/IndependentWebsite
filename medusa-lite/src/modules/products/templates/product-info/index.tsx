import { HttpTypes } from "@medusajs/types"
import { getLocale } from "@lib/data/locale-actions"
import {
  getLocalizedProductDescription,
  getLocalizedProductTitle,
} from "@lib/util/localized-product-title"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const locale = await getLocale()
  const productTitle = getLocalizedProductTitle(product, locale)
  const productDescription = getLocalizedProductDescription(product, locale)

  return (
    <div
      id="product-info"
      className="rounded-[2rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] p-7 shadow-[0_18px_40px_-32px_rgba(92,72,45,0.18)]"
    >
      <div className="mx-auto flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-[color:var(--text-muted)] hover:text-[color:var(--accent-strong)]"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-[color:var(--text-strong)]"
          data-testid="product-title"
        >
          {productTitle}
        </Heading>

        <Text
          className="text-medium whitespace-pre-line text-[color:var(--text-body)]"
          data-testid="product-description"
        >
          {productDescription}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
