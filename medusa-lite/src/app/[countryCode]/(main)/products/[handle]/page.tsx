import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import { cache } from "react"

import { PRODUCT_UI_CONTENT } from "@lib/data/homepage"
import { getLocalizedHomeContentSection } from "@lib/data/localized-homepage"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { normalizeLocale } from "@lib/data/supported-locales"
import {
  getLocalizedProductDescription,
  getLocalizedProductTitle,
} from "@lib/util/localized-product-title"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export const revalidate = 300

function getPageLabels(locale?: string | null) {
  if (locale?.startsWith("zh")) {
    return {
      back: "返回产品",
      home: "首页",
      missing: "未找到产品。",
    }
  }

  if (locale?.startsWith("ar")) {
    return {
      back: "العودة إلى المنتجات",
      home: "الرئيسية",
      missing: "لم يتم العثور على المنتج.",
    }
  }

  return {
    back: "Back to products",
    home: "Home",
    missing: "Product not found.",
  }
}

const fetchProduct = cache(async (handle: string) => {
  return getProductByHandle(handle)
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const product = await fetchProduct(params.handle)

  if (!product) {
    return { title: "Product not found" }
  }

  const locale = normalizeLocale()
  const productTitle = getLocalizedProductTitle(product, locale)
  const productDescription = getLocalizedProductDescription(product, locale)

  return {
    title: `${productTitle} | Kids Toys`,
    description: product.subtitle || productDescription || productTitle,
    openGraph: {
      title: `${productTitle} | Kids Toys`,
      description: product.subtitle || productDescription || productTitle,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  // ponytail: keep public product pages cacheable; use URL locale if SSR translations matter.
  const locale = normalizeLocale()
  const [region, productUiContent, product] = await Promise.all([
    getRegion(params.countryCode),
    getLocalizedHomeContentSection(
      "product_ui_content",
      PRODUCT_UI_CONTENT,
      locale
    ),
    fetchProduct(params.handle),
  ])
  const labels = getPageLabels(locale)

  if (!region) {
    return null
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
        <div className="content-container py-12">
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-12 text-center text-sm text-black/60">
            {labels.missing}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/products"
              className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
            >
              {labels.back}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const productTitle = getLocalizedProductTitle(product, locale)
  const productDescription = getLocalizedProductDescription(product, locale)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#f3efe6_55%,#efe9df_100%)]">
      <div className="content-container py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/products"
            className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
          >
            {labels.back}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black/60 hover:border-black/20"
          >
            {labels.home}
          </Link>
        </div>

        <div className="grid gap-8 rounded-3xl border border-black/5 bg-white/90 p-8 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.35)] md:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={productTitle}
                  fill
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/40">
                  {productUiContent.noImageLabel}
                </div>
              )}
            </div>
            {productDescription ? (
              <p className="mt-6 text-sm leading-6 text-black/70">
                {productDescription}
              </p>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                {productUiContent.productInformationLabel}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-black">
                {productTitle}
              </h1>
              {product.subtitle ? (
                <p className="mt-2 text-sm text-black/60">
                  {product.subtitle}
                </p>
              ) : null}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
