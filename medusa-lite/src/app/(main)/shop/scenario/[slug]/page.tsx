import CountryPage, {
  generateMetadata as generateCountryMetadata,
} from "../../../../[countryCode]/(main)/shop/scenario/[slug]/page"
import { getDefaultCountryCode } from "@lib/data/default-country-code"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

async function withCountryCode(params: Props["params"]) {
  const [countryCode, resolvedParams] = await Promise.all([
    getDefaultCountryCode(),
    params,
  ])
  return { ...resolvedParams, countryCode }
}

export async function generateMetadata(props: Props) {
  return generateCountryMetadata({
    ...props,
    params: withCountryCode(props.params),
  })
}

export default function ScenarioPage(props: Props) {
  return CountryPage({
    ...props,
    params: withCountryCode(props.params),
  })
}
