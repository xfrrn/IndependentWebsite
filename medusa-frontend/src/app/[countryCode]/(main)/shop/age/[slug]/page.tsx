import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ShopLandingPage from "@components/shop/shop-landing-page"
import { AGE_PAGE_CONTENT } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import { matchesAgeRange, matchesCategoryKey } from "@lib/util/product-meta"
import { sortProducts } from "@lib/util/shop-sort"
import ShopSortBar from "@components/shop/shop-sort-bar"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ sort?: string; cat?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const content = await getSiteContentSection("age_page_content", AGE_PAGE_CONTENT)
  const page = content.pages.find((item) => item.slug === params.slug)
  if (!page) return { title: "Age Collection" }

  return {
    title: `${content.titlePrefix}${page.title} | Shop by Age`,
    description: page.description,
  }
}

export default async function AgeLandingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const content = await getSiteContentSection("age_page_content", AGE_PAGE_CONTENT)
  const page = content.pages.find((item) => item.slug === params.slug)

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
      fields: "*variants.calculated_price,+metadata,created_at",
    },
  })

  const ageFiltered = products.filter((product) =>
    matchesAgeRange(product, params.slug)
  )

  const category = searchParams.cat ?? "all"
  const categoryFiltered =
    category === "all"
      ? ageFiltered
      : ageFiltered.filter((product) => matchesCategoryKey(product, category))

  const sorted = sortProducts(categoryFiltered, searchParams.sort)

  return (
    <ShopLandingPage
      eyebrow={content.eyebrow}
      title={`${content.titlePrefix}${page.title}`}
      description={page.description}
      emptyMessage={content.emptyMessage}
      products={sorted}
      region={region}
      homeHref={`/${params.countryCode}`}
      actions={
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {content.filters.map((filter) => (
              <Link
                key={filter.value}
                href={{
                  pathname: `/${params.countryCode}/shop/age/${params.slug}`,
                  query: {
                    ...searchParams,
                    cat: filter.value === "all" ? undefined : filter.value,
                  },
                }}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  category === filter.value
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-black/10 text-black/60 hover:border-black/20"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          <ShopSortBar
            countryCode={params.countryCode}
            pathname={`/shop/age/${params.slug}`}
            searchParams={{ sort: searchParams.sort, cat: searchParams.cat }}
            total={sorted.length}
          />
        </div>
      }
    />
  )
}
