import Footer from "@modules/layout/templates/footer"
import CountryProductPage, {
  generateMetadata as generateCountryMetadata,
} from "../../[countryCode]/(main)/products/[handle]/page"

export const revalidate = 300

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "gb"

type Props = {
  params: Promise<{ handle: string }>
}

function withCountryCode(handle: string) {
  return Promise.resolve({
    countryCode: DEFAULT_COUNTRY_CODE,
    handle,
  })
}

export async function generateMetadata(props: Props) {
  const params = await props.params
  return generateCountryMetadata({
    params: withCountryCode(params.handle),
  })
}

export default async function ProductPage(props: Props) {
  const params = await props.params

  return (
    <>
      <CountryProductPage params={withCountryCode(params.handle)} />
      <Footer />
    </>
  )
}
