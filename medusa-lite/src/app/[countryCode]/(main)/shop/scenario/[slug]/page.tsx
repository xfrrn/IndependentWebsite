import { Metadata } from "next"
import { notFound } from "next/navigation"

import ShopLandingPage from "@components/shop/shop-landing-page"
import ShopSortBar from "@components/shop/shop-sort-bar"
import { PRODUCT_LIST_FIELDS } from "@lib/data/product-fields"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getLocale } from "@lib/data/locale-actions"
import { matchesScenarioKey } from "@lib/util/product-meta"
import { sortProducts } from "@lib/util/shop-sort"

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

  if (!page) {
    return {
      title: "Scenario not found",
    }
  }

  return {
    title: `${page.title} | Scenarios`,
    description: page.description,
  }
}

export default async function ScenarioLandingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const locale = await getLocale()
  const page = SCENARIO_PAGES[params.slug]

  if (!page) {
    notFound()
  }

  const region = await getRegion(params.countryCode)
  if (!region) {
    notFound()
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 24,
      fields: PRODUCT_LIST_FIELDS,
    },
  })

  const filtered = products.filter((product) =>
    matchesScenarioKey(product, params.slug)
  )

  const sorted = sortProducts(filtered, searchParams.sort)

  return (
    <ShopLandingPage
      eyebrow="Scenario"
      title={page.title}
      description={page.description}
      emptyMessage="No products tagged for this scenario yet. Add metadata.scenario_key or metadata.scenario_keys to match this scenario."
      products={sorted}
      region={region}
      homeHref="/"
      currentLocale={locale}
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
