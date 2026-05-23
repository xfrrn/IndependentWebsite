import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
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
          {product.title}
        </Heading>

        <Text
          className="text-medium whitespace-pre-line text-[color:var(--text-body)]"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
