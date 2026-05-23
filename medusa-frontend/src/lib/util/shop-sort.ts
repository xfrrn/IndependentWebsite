import { HttpTypes } from "@medusajs/types"

export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sort?: string
) {
  if (!sort || sort === "featured") {
    return products
  }

  const copy = [...products]

  if (sort === "newest") {
    return copy.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime
    })
  }

  if (sort === "price-asc" || sort === "price-desc") {
    return copy.sort((a, b) => {
      const aPrice = a.variants?.[0]?.calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
      const bPrice = b.variants?.[0]?.calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice
    })
  }

  return copy
}
