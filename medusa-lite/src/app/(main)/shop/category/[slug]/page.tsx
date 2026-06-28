import CountryPage, {
  generateMetadata as generateCountryMetadata,
} from "../../../../[countryCode]/(main)/shop/category/[slug]/page"

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "gb"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

async function withCountryCode(params: Props["params"]) {
  return { ...(await params), countryCode: DEFAULT_COUNTRY_CODE }
}

export async function generateMetadata(props: Props) {
  return generateCountryMetadata({
    ...props,
    params: withCountryCode(props.params),
  })
}

export default function CategoryPage(props: Props) {
  return CountryPage({
    ...props,
    params: withCountryCode(props.params),
  })
}
