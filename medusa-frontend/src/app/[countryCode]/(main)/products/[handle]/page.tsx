import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import {
  getMetadataString,
} from "@lib/util/product-meta"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

async function fetchProduct(handle: string, countryCode: string) {
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      handle,
      fields: "*variants.calculated_price,+metadata,+tags,*images",
    },
  })

  return response.products[0]
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const product = await fetchProduct(params.handle, params.countryCode)

  if (!product) {
    return { title: "Product not found" }
  }

  return {
    title: `${product.title} | Kids Toys`,
    description: product.subtitle || product.title,
    openGraph: {
      title: `${product.title} | Kids Toys`,
      description: product.subtitle || product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    return null
  }

  const product = await fetchProduct(params.handle, params.countryCode)

  if (!product) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
        <div className="content-container py-12">
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-12 text-center text-sm text-black/60">
            Product not found.
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`/${params.countryCode}/products`}
              className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const ageRange = getMetadataString(product, "age_range")
  const categoryKey = getMetadataString(product, "category_key")
  const scenarioKey = getMetadataString(product, "scenario_key")
  const scenarioKeys = getMetadataString(product, "scenario_keys")

  const tags = [
    ageRange ? `Age ${ageRange}` : null,
    categoryKey ? `Category: ${categoryKey}` : null,
    scenarioKey ? `Scenario: ${scenarioKey}` : null,
    scenarioKeys ? `Scenarios: ${scenarioKeys}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
      <div className="content-container py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/${params.countryCode}/products`}
            className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
          >
            Back to products
          </Link>
          <Link
            href={`/${params.countryCode}`}
            className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
          >
            Home
          </Link>
        </div>

        <div className="grid gap-8 rounded-3xl border border-black/5 bg-white/90 p-8 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.35)] md:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/40">
                  No Image
                </div>
              )}
            </div>
            {product.description ? (
              <p className="mt-6 text-sm leading-6 text-black/70">
                {product.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                Product details
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-black">
                {product.title}
              </h1>
              {product.subtitle ? (
                <p className="mt-2 text-sm text-black/60">
                  {product.subtitle}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
              <ProductActionsWrapper id={product.id} region={region} />
            </div>

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
