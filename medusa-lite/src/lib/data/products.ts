"use server"

import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"
import { getRegion, retrieveRegion } from "./regions"
import { sortProducts } from "@lib/util/sort-products"
import {
  StoreProduct,
  StoreProductCategory,
  StoreProductVariant,
} from "@/lib/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { prisma } from "@/lib/db"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "./cache"

function stableJson(value: unknown): string {
  if (!value || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`)
    .join(",")}}`
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }
  return typeof value === "string" ? [value] : []
}

function asLimit(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const productInclude = {
  variants: true,
} satisfies Prisma.ProductInclude

const listProductsCached = unstable_cache(
  async (
    pageParam: number,
    queryParamsJson: string,
    countryCode?: string,
    regionId?: string
  ) => {
    const queryParams = JSON.parse(queryParamsJson || "{}") as Record<string, unknown>
    const limit = asLimit(queryParams.limit, 12)
    const _pageParam = Math.max(pageParam, 1)
    const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

    let region: Awaited<ReturnType<typeof getRegion>>

    if (countryCode) {
      region = await getRegion(countryCode)
    } else {
      region = await retrieveRegion(regionId!)
    }

    if (!region) {
      return { response: { products: [], count: 0 }, nextPage: null, queryParams }
    }

    const where: Prisma.ProductWhereInput = { status: "published" }
    if (typeof queryParams.handle === "string") where.handle = queryParams.handle
    if (queryParams.id) {
      const ids = asStringArray(queryParams.id)
      where.id = { in: ids }
    }
    if (queryParams.category_id) {
      const ids = asStringArray(queryParams.category_id)
      where.categories = { some: { categoryId: { in: ids } } }
    }
    if (queryParams.collection_id) {
      const ids = asStringArray(queryParams.collection_id)
      where.collections = { some: { collectionId: { in: ids } } }
    }

    const [products, count] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ])
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      response: { products: products.map(formatProduct), count },
      nextPage,
      queryParams,
    }
  },
  ["list-products"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.collections],
  }
)

const getProductByHandleCached = unstable_cache(
  async (handle: string) => {
    const product = await prisma.product.findFirst({
      where: { handle, status: "published" },
      include: productInclude,
    })

    return product ? formatProduct(product) : null
  },
  ["product-by-handle"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.collections],
  }
)

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: Record<string, unknown>
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: Record<string, unknown>
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }
  return listProductsCached(pageParam, stableJson(queryParams ?? {}), countryCode, regionId)
}

export const getProductByHandle = async (handle: string): Promise<StoreProduct | null> => {
  return getProductByHandleCached(handle)
}

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: Record<string, unknown>
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: Record<string, unknown>
}> => {
  const limit = asLimit(queryParams?.limit, 12)

  if (sortBy === "created_at") {
    return listProducts({
      pageParam: page,
      queryParams: { ...queryParams, limit },
      countryCode,
    })
  }

  const { response: { products, count } } = await listProducts({
    pageParam: 0,
    queryParams: { ...queryParams, limit: 100 },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return { response: { products: paginatedProducts, count }, nextPage, queryParams }
}

type CategoryRow = {
  id: string
  name: string
  handle: string
  description: string | null
  metadata: unknown
  isActive: boolean
}

type VariantRow = {
  id: string
  title: string
  sku: string | null
  inventoryQuantity: number
  calculatedPrice: unknown
  images: unknown
  options: unknown
  metadata: unknown
}

type ProductRow = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  description: string | null
  thumbnail: string | null
  images: unknown
  metadata: unknown
  tags: unknown
  status: string
  createdAt: Date
  updatedAt: Date
  variants: VariantRow[]
  categories?: { category: CategoryRow }[]
  collections?: { collection: { id: string; title: string; handle: string | null } }[]
}

function formatProduct(product: ProductRow): StoreProduct {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    thumbnail: product.thumbnail,
    images: product.images as StoreProduct["images"],
    metadata: product.metadata as StoreProduct["metadata"],
    tags: product.tags as StoreProduct["tags"],
    status: product.status,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
    variants: product.variants.map(formatVariant),
    categories:
      product.categories?.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        handle: pc.category.handle,
        description: pc.category.description,
        metadata: pc.category.metadata as StoreProductCategory["metadata"],
        is_active: pc.category.isActive,
      })) ?? [],
    collection: product.collections?.[0]?.collection
      ? {
          id: product.collections[0].collection.id,
          title: product.collections[0].collection.title,
          handle: product.collections[0].collection.handle,
        }
      : undefined,
  }
}

function formatVariant(variant: VariantRow): StoreProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    inventory_quantity: variant.inventoryQuantity,
    calculated_price: variant.calculatedPrice as StoreProductVariant["calculated_price"],
    images: variant.images as StoreProductVariant["images"],
    options: variant.options as StoreProductVariant["options"],
    metadata: variant.metadata as StoreProductVariant["metadata"],
  }
}
