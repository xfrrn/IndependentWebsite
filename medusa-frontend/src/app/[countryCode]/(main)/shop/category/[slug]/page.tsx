import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ShopLandingPage from "@components/shop/shop-landing-page"
import { CATEGORY_PAGE_CONTENT } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import { matchesCategoryKey } from "@lib/util/product-meta"
import { sortProducts } from "@lib/util/shop-sort"
import ShopSortBar from "@components/shop/shop-sort-bar"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const content = await getSiteContentSection(
    "category_page_content",
    CATEGORY_PAGE_CONTENT
  )
  const page = content.pages.find((item) => item.slug === params.slug)

  return {
    title: page ? `${page.title} | Categories` : "Category",
    description: page?.description,
  }
}

export default async function CategoryLandingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const content = await getSiteContentSection(
    "category_page_content",
    CATEGORY_PAGE_CONTENT
  )
  const page = content.pages.find((item) => item.slug === params.slug)

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
    matchesCategoryKey(product, params.slug)
  )

  const sorted = sortProducts(filtered, searchParams.sort)

  return (
    <ShopLandingPage
      eyebrow={content.eyebrow}
      title={page?.title ?? "Category"}
      description={page?.description ?? "More curated play styles coming soon."}
      emptyMessage={content.emptyMessage}
      products={sorted}
      region={region}
      homeHref={`/${params.countryCode}`}
      actions={
        <ShopSortBar
          countryCode={params.countryCode}
          pathname={`/shop/category/${params.slug}`}
          searchParams={{ sort: searchParams.sort }}
          total={sorted.length}
        />
      }
    />
  )
}
