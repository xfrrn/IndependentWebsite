import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block h-9 w-32 animate-pulse rounded-full bg-[var(--bg-panel)]" />
  }

  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.78)] p-5 text-[color:var(--text-strong)] shadow-[0_14px_28px_-24px_rgba(92,72,45,0.18)]">
      <span
        className={clx("text-xl-semi", {
          "text-[color:var(--accent-strong)]": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-sm">
            <span className="text-[color:var(--text-muted)]">Original: </span>
            <span
              className="line-through text-[color:var(--text-body)]"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-sm font-semibold text-[color:var(--accent-warm)]">
            -{selectedPrice.percentage_diff}%
          </span>
        </div>
      )}
    </div>
  )
}
