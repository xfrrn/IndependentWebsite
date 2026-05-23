import ProductsRow from "./products-row"

export default async function BestSellersRow({
  countryCode,
}: {
  countryCode: string
}) {
  return (
    <ProductsRow
      countryCode={countryCode}
      title="Best Sellers"
      subtitle="Parent-loved picks for everyday play"
    />
  )
}
