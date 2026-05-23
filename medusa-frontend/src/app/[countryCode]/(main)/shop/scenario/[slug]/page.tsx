import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ShopLandingPage from "@components/shop/shop-landing-page"
import { matchesScenarioKey } from "@lib/util/product-meta"
import { sortProducts } from "@lib/util/shop-sort"
import ShopSortBar from "@components/shop/shop-sort-bar"

const SCENARIO_PAGES: Record<string, { title: string; description: string }> = {
  gifts: {
    title: "Gifts by Age",
    description: "Thoughtful picks for birthdays and milestones.",
  },
  travel: {
    title: "Travel Toys",
    description: "Compact, calm play for on-the-go moments.",
  },
  "quiet-time": {
    title: "Quiet Time Favorites",
    description: "Independent play that feels peaceful and focused.",
  },
  favorites: {
    title: "Family Favorites",
    description: "Parent-loved picks for shared playtime.",
  },
  featured: {
    title: "Featured Picks",
    description: "Highlighting calm, confidence-building toys.",
  },
  shipping: {
    title: "Shipping Details",
    description: "Free shipping on orders over $99.",
  },
}

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = SCENARIO_PAGES[params.slug]

  return {
    title: page ? `${page.title} | Scenarios` : "Scenario",
    description: page?.description,
  }
}

export default async function ScenarioLandingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const page = SCENARIO_PAGES[params.slug]

  const region = await getRegion(params.countryCode)
  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 24,
      fields: "*variants.calculated_price,+metadata,created_at",
    },
  })

  const filtered = products.filter((product) =>
    matchesScenarioKey(product, params.slug)
  )

  const sorted = sortProducts(filtered, searchParams.sort)

  return (
    <ShopLandingPage
      eyebrow="Scenario"
      title={page?.title ?? "Scenario"}
      description={page?.description ?? "More curated scenarios coming soon."}
      emptyMessage="No products tagged for this scenario yet. Add metadata.scenario_key or metadata.scenario_keys to match this scenario."
      products={sorted}
      region={region}
      homeHref={`/${params.countryCode}`}
      actions={
        <ShopSortBar
          countryCode={params.countryCode}
          pathname={`/shop/scenario/${params.slug}`}
          searchParams={{ sort: searchParams.sort }}
          total={sorted.length}
        />
      }
    />
  )
}
