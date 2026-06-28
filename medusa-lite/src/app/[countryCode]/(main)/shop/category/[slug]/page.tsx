import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"

import ShopLandingPage from "@components/shop/shop-landing-page"
import ShopSortBar from "@components/shop/shop-sort-bar"
import { getCategoryByHandle } from "@lib/data/categories"
import { CATEGORY_PAGE_CONTENT } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { PRODUCT_LIST_FIELDS } from "@lib/data/product-fields"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { normalizeLocale } from "@lib/data/supported-locales"
import { sortProducts } from "@lib/util/shop-sort"
import { Pagination } from "@modules/store/components/pagination"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

const PRODUCT_LIMIT = 20

export const revalidate = 300

const fetchCategory = cache(async (slug: string) => getCategoryByHandle([slug]))

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = normalizeLocale()
  const [content, category] = await Promise.all([
    getLocalizedHomeContentSection(
      "category_page_content",
      CATEGORY_PAGE_CONTENT,
      locale
    ),
    fetchCategory(params.slug),
  ])

  if (!category) {
    return {
      title: "Category not found",
    }
  }

  const page = content.pages.find((item) => item.slug === params.slug)
  const title = page?.title ?? category.name
  const description =
    page?.description ?? category.description ?? `${category.name} category.`

  return {
    title: `${title} | Categories`,
    description,
  }
}

export default async function CategoryLandingPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  // ponytail: keep public category pages cacheable; use URL locale if SSR translations matter.
  const locale = normalizeLocale()
  const [content, category, region] = await Promise.all([
    getLocalizedHomeContentSection(
      "category_page_content",
      CATEGORY_PAGE_CONTENT,
      locale
    ),
    fetchCategory(params.slug),
    getRegion(params.countryCode),
  ])

  if (!category) {
    notFound()
  }

  if (!region) {
    notFound()
  }

  const page = content.pages.find((item) => item.slug === params.slug)
  const pageNumber = Math.max(Number(searchParams.page) || 1, 1)
  const title = page?.title ?? category.name
  const description =
    page?.description ?? category.description ?? `${category.name} category.`

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: pageNumber,
    regionId: region.id,
    queryParams: {
      limit: PRODUCT_LIMIT,
      category_id: [category.id],
      fields: PRODUCT_LIST_FIELDS,
    },
  })

  const sorted = sortProducts(products, searchParams.sort)
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <ShopLandingPage
      eyebrow={content.eyebrow}
      title={title}
      description={description}
      emptyMessage={content.emptyMessage}
      products={sorted}
      region={region}
      homeHref="/"
      homeLabel={locale?.startsWith("zh") ? "首页" : locale?.startsWith("ar") ? "الرئيسية" : "Home"}
      currentLocale={locale}
      actions={
        <ShopSortBar
          countryCode={params.countryCode}
          pathname={`/shop/category/${params.slug}`}
          searchParams={{ page: searchParams.page, sort: searchParams.sort }}
          total={count}
        />
      }
      footer={
        totalPages > 1 ? (
          <Pagination page={pageNumber} totalPages={totalPages} />
        ) : null
      }
    />
  )
}
