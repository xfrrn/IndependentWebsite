"use server"

import { getRegion, retrieveRegion } from "./regions"
import { sortProducts } from "@lib/util/sort-products"
import { StoreProduct, StoreProductVariant } from "@/lib/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { prisma } from "@/lib/db"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: Record<string, any>
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: Record<string, any>
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: any

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return { response: { products: [], count: 0 }, nextPage: null }
  }

  const where: any = { status: "published" }
  if (queryParams?.handle) where.handle = queryParams.handle
  if (queryParams?.id) {
    const ids = Array.isArray(queryParams.id) ? queryParams.id : [queryParams.id]
    where.id = { in: ids }
  }
  if (queryParams?.category_id) {
    const ids = Array.isArray(queryParams.category_id)
      ? queryParams.category_id
      : [queryParams.category_id]
    where.categories = { some: { categoryId: { in: ids } } }
  }

  const [products, count] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: true,
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
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
}

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: Record<string, any>
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: Record<string, any>
}> => {
  const limit = queryParams?.limit || 12

  const { response: { products, count } } = await listProducts({
    pageParam: 0,
    queryParams: { ...queryParams, limit: 100 },
    countryCode,
  })

  const sortedProducts = sortProducts(products as any, sortBy)
  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return { response: { products: paginatedProducts as any, count }, nextPage, queryParams }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProduct(product: any): StoreProduct {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    thumbnail: product.thumbnail,
    images: product.images,
    metadata: product.metadata,
    tags: product.tags,
    status: product.status,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
    variants: product.variants.map(formatVariant),
    categories:
      product.categories?.map((pc: any) => ({
        id: pc.category.id,
        name: pc.category.name,
        handle: pc.category.handle,
        description: pc.category.description,
        metadata: pc.category.metadata,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatVariant(variant: any): StoreProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    inventory_quantity: variant.inventoryQuantity,
    calculated_price: variant.calculatedPrice,
    images: variant.images,
    options: variant.options,
    metadata: variant.metadata,
  }
}
