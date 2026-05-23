import Link from "next/link"
import { Metadata } from "next"

import { HttpTypes } from "@medusajs/types"
import { PRODUCTS_PAGE_CONTENT } from "@lib/data/homepage"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getSiteContentSection } from "@lib/data/site-content"
import ProductPreview from "@modules/products/components/product-preview"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = {
  title: "Kids Toys | Products",
  description: "Browse age-clear, parent-trusted toys.",
}

function matchesQuery(product: HttpTypes.StoreProduct, q: string) {
  const needle = q.toLowerCase()
  return (
    product.title?.toLowerCase().includes(needle) ||
    product.handle?.toLowerCase().includes(needle) ||
    product.description?.toLowerCase().includes(needle)
  )
}

export default async function ProductsPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const content = await getSiteContentSection(
    "products_page_content",
    PRODUCTS_PAGE_CONTENT
  )

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
      fields: "*variants.calculated_price,+metadata",
    },
  })

  const query = searchParams.q?.trim() || ""
  const filtered = query
    ? products.filter((product) => matchesQuery(product, query))
    : products

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
      <div className="content-container py-12">
        <div className="mb-8 flex items-start justify-between gap-6 rounded-3xl border border-black/5 bg-white/90 p-8 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.35)]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              {content.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-black">
              {query
                ? `${content.searchTitlePrefix}${query}${content.searchTitleSuffix}`
                : content.defaultTitle}
            </h1>
            <p className="mt-3 text-sm text-black/60">
              {query
                ? `${content.searchResultsLabelPrefix}${filtered.length}${content.searchResultsLabelSuffix}`
                : content.defaultDescription}
            </p>
          </div>
          <Link
            href={`/${params.countryCode}`}
            className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
          >
            {content.homeLabel}
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-12 text-center text-sm text-black/60">
            {content.emptyMessage}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {filtered.map((product) => (
              <li
                key={product.id}
                className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)]"
              >
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
