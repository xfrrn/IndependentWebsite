import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import { StoreProduct } from "@/lib/types"
import { PRODUCTS_PAGE_CONTENT } from "@lib/data/homepage"
import { getLocale } from "@lib/data/locale-actions"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { PRODUCT_LIST_FIELDS } from "@lib/data/product-fields"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  getLocalizedProductDescription,
  getLocalizedProductTitle,
} from "@lib/util/localized-product-title"
import ProductPreview from "@modules/products/components/product-preview"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = {
  title: "Kids Toys | Products",
  description: "Browse age-clear, parent-trusted toys.",
}

function matchesQuery(product: StoreProduct, q: string, locale?: string | null) {
  const needle = q.toLowerCase()
  const title = getLocalizedProductTitle(product, locale)
  const description = getLocalizedProductDescription(product, locale)
  return (
    title.toLowerCase().includes(needle) ||
    product.title?.toLowerCase().includes(needle) ||
    product.handle?.toLowerCase().includes(needle) ||
    description.toLowerCase().includes(needle) ||
    product.description?.toLowerCase().includes(needle)
  )
}

export default async function ProductsPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const locale = await getLocale()
  const content = await getLocalizedHomeContentSection(
    "products_page_content",
    PRODUCTS_PAGE_CONTENT,
    locale
  )

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

  const query = searchParams.q?.trim() || ""
  const filtered = query
    ? products.filter((product) => matchesQuery(product, query, locale))
    : products

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <div className="content-container py-12">
        <div className="mb-8 flex items-start justify-between gap-6 rounded-3xl border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-soft)]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
              {content.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">
              {query
                ? `${content.searchTitlePrefix}${query}${content.searchTitleSuffix}`
                : content.defaultTitle}
            </h1>
            <p className="mt-3 text-sm text-[color:var(--text-body)]">
              {query
                ? `${content.searchResultsLabelPrefix}${filtered.length}${content.searchResultsLabelSuffix}`
                : content.defaultDescription}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-body)] hover:border-[color:var(--accent)]"
          >
            {content.homeLabel}
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[var(--bg-card)] p-12 text-center text-sm text-[color:var(--text-body)]">
            {content.emptyMessage}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {filtered.map((product) => (
              <li
                key={product.id}
                className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-soft)]"
              >
                <ProductPreview product={product} region={region} currentLocale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
