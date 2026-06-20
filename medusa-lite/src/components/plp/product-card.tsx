import Image from "next/image"
import Link from "next/link"

import { HttpTypes } from "@medusajs/types"
import { PRODUCT_UI_CONTENT } from "@lib/data/homepage"
import { getSiteContentSection } from "@lib/data/site-content"
import {
  getAgeRange,
  getHighlight,
  getSkills,
  getToyType,
} from "@lib/util/product-meta"

export default async function ProductCard({
  product,
  countryCode,
  priceLabel,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  priceLabel: string
}) {
  const content = await getSiteContentSection(
    "product_ui_content",
    PRODUCT_UI_CONTENT
  )
  const ageRange = getAgeRange(product)
  const toyType = getToyType(product)
  const highlight = getHighlight(product)
  const skills = getSkills(product)

  return (
    <Link
      href={`/${countryCode}/products/${product.handle}`}
      className="group ui-card ui-card-hover flex h-full flex-col overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-panel)]">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            {content.noImageLabel}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--text-strong)] transition duration-300 ease-out group-hover:text-[color:var(--accent-strong)]">
            {product.title}
          </h3>
          {product.subtitle ? (
            <p className="mt-2 text-sm text-[color:var(--text-body)]">
              {product.subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {ageRange ? (
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
              {content.agePrefix}
              {ageRange}
            </span>
          ) : null}
          {toyType ? (
            <span className="rounded-full bg-[rgba(217,109,79,0.12)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-warm)]">
              {toyType}
            </span>
          ) : null}
          {highlight ? (
            <span className="rounded-full bg-[rgba(245,193,78,0.16)] px-3 py-1 text-xs font-semibold text-[#b77712]">
              {highlight}
            </span>
          ) : null}
          {skills.slice(0, 1).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[rgba(255,250,242,0.88)] px-3 py-1 text-xs text-[color:var(--text-body)]"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="line-clamp-2 text-sm text-[color:var(--text-body)]">
          {product.description || content.fallbackDescription}
        </p>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="font-semibold text-[color:var(--text-strong)] transition duration-300 ease-out group-hover:text-[color:var(--accent-strong)]">
            {priceLabel}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)] transition duration-300 ease-out group-hover:text-[color:var(--accent)]">
            {content.viewDetailsLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
