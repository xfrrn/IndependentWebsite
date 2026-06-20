import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

type QueryStrategy = "default" | "newest"

export default async function ProductsRow({
  countryCode,
  title,
  subtitle,
  description,
  strategy = "default",
  showProductNames = true,
  showProductPrices = true,
}: {
  countryCode: string
  title: string
  subtitle: string
  description?: string
  strategy?: QueryStrategy
  showProductNames?: boolean
  showProductPrices?: boolean
}) {
  const region = await getRegion(countryCode)

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
          {sorted.map((product) => (
            <li key={product.id} className="group relative">
              <div className="ui-card ui-card-hover bg-[var(--bg-card)] p-4 transition duration-300 ease-out group-hover:border-[color:var(--accent)]/20">
                <ProductPreview
                  product={product as HttpTypes.StoreProduct}
                  region={region}
                  isFeatured
                  showTitle={showProductNames}
                  showPrice={showProductPrices}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
