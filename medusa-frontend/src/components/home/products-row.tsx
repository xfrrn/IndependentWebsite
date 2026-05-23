import { HttpTypes } from "@medusajs/types"
import { PRODUCT_UI_CONTENT } from "@lib/data/homepage"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getSiteContentSection } from "@lib/data/site-content"
import ProductPreview from "@modules/products/components/product-preview"

type QueryStrategy = "default" | "newest"

export default async function ProductsRow({
  countryCode,
  title,
  subtitle,
  description,
  strategy = "default",
}: {
  countryCode: string
  title: string
  subtitle: string
  description?: string
  strategy?: QueryStrategy
}) {
  const [region, productUiContent] = await Promise.all([
    getRegion(countryCode),
    getSiteContentSection("product_ui_content", PRODUCT_UI_CONTENT),
  ])

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      fields:
        "id,handle,title,subtitle,thumbnail,images,metadata,created_at,updated_at,*variants.calculated_price",
    },
  })

  if (!products.length) {
    return null
  }

  const sorted = [...products]

  if (strategy === "newest") {
    sorted.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime
    })
  }

  return (
    <section className="bg-[var(--bg-canvas)]">
      <div className="content-container ui-section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ui-eyebrow">{title}</p>
            <h2 className="ui-title">{subtitle}</h2>
            {description ? <p className="ui-subtitle">{description}</p> : null}
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {sorted.map((product) => {
            const ageRange =
              typeof product.metadata?.age_range === "string"
                ? product.metadata.age_range
                : null

            return (
              <li key={product.id} className="group relative">
                {ageRange ? (
                  <span className="absolute left-3 top-3 z-10 rounded-full border border-[color:var(--border-soft)] bg-[rgba(251,247,240,0.92)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-body)] shadow-[0_8px_18px_-12px_rgba(85,63,39,0.22)] transition duration-300 ease-out group-hover:border-[color:var(--accent)]/30 group-hover:bg-[var(--accent-soft)] group-hover:text-[color:var(--accent-strong)]">
                    {productUiContent.agesPrefix}
                    {ageRange}
                  </span>
                ) : null}
                <div className="ui-card ui-card-hover bg-[var(--bg-card)] p-4 transition duration-300 ease-out group-hover:border-[color:var(--accent)]/20">
                  <ProductPreview
                    product={product as HttpTypes.StoreProduct}
                    region={region}
                    isFeatured
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
