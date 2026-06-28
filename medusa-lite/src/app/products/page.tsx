import Footer from "@modules/layout/templates/footer"
import CountryProductsPage, {
  metadata,
} from "../[countryCode]/(main)/products/page"

export { metadata }
export const revalidate = 300

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "gb"

export default async function ProductsPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  return (
    <>
      <CountryProductsPage
        params={Promise.resolve({ countryCode: DEFAULT_COUNTRY_CODE })}
        searchParams={props.searchParams}
      />
      <Footer />
    </>
  )
}
