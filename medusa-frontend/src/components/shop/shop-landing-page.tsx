import Link from "next/link"
import { ReactNode } from "react"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

export default function ShopLandingPage({
  eyebrow,
  title,
  description,
  emptyMessage,
  products,
  region,
  actions,
  homeHref,
}: {
  eyebrow: string
  title: string
  description: string
  emptyMessage: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  actions?: ReactNode
  homeHref: string
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
      <div className="content-container py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-body)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)]"
          >
            Home
          </Link>
        </div>

        <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.9)] p-8 shadow-[0_20px_45px_-30px_rgba(92,72,45,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">{title}</h1>
          <p className="mt-3 text-sm text-[color:var(--text-body)]">{description}</p>
        </div>

        {actions ? <div className="mt-6">{actions}</div> : null}

        <div className="mt-10">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.72)] p-12 text-center text-sm text-[color:var(--text-body)]">
              {emptyMessage}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--bg-card)] p-4 shadow-[0_18px_40px_-30px_rgba(92,72,45,0.18)]"
                >
                  <ProductPreview product={product} region={region} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
