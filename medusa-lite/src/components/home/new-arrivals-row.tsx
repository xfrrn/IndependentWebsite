import ProductsRow from "./products-row"

export default async function NewArrivalsRow({
  countryCode,
}: {
  countryCode: string
}) {
  return (
    <ProductsRow
      countryCode={countryCode}
      title="New Arrivals"
      subtitle="Fresh picks for curious minds"
      strategy="newest"
    />
  )
}
