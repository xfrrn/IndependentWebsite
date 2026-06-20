import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

const SECTION_COPY = {
  title: "PLAYHOUSE COLLECTION",
  subtitle: "Popular picks for calm, confident play",
}

export default async function FeaturedCollection({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  const featured = collections?.[0]
  if (!featured) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: featured.id,
      limit: 10,
      fields:
        "id,handle,title,subtitle,thumbnail,images,metadata,*variants.calculated_price",
    },
  })

  return (
    <section className="bg-[#f9f5f0]">
      <div className="content-container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              {SECTION_COPY.title}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-black">
              {SECTION_COPY.subtitle}
            </h2>
          </div>
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60">
            {featured.title}
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => {
            const ageRange =
              typeof product.metadata?.age_range === "string"
                ? product.metadata.age_range
                : null

            return (
              <li key={product.id} className="relative">
                {ageRange ? (
                  <span className="absolute left-3 top-3 z-10 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/60">
                    Ages {ageRange}
                  </span>
                ) : null}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)]">
                  <ProductPreview product={product as HttpTypes.StoreProduct} region={region} isFeatured />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
