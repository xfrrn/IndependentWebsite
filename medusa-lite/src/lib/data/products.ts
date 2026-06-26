"use server"

import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"
import { getRegion, retrieveRegion } from "./regions"
import { sortProducts } from "@lib/util/sort-products"
import { getInternalBaseURL } from "@lib/util/env"
import { StoreProduct, StoreProductVariant } from "@/lib/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const API_BASE = getInternalBaseURL()

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

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  if (queryParams?.fields) params.set("fields", queryParams.fields)
  if (queryParams?.handle) params.set("handle", queryParams.handle)
  if (queryParams?.id) {
    const ids = Array.isArray(queryParams.id) ? queryParams.id : [queryParams.id]
    ids.forEach((id: string) => params.append("id", id))
  }
  if (queryParams?.category_id) {
    const ids = Array.isArray(queryParams.category_id) ? queryParams.category_id : [queryParams.category_id]
    ids.forEach((id: string) => params.append("category_id", id))
  }

  const res = await fetch(`${API_BASE}/api/products?${params}`, {
    next: getCatalogCacheOptions(CACHE_TAGS.products),
    cache: "force-cache",
  })

  const { products, count } = await res.json()
  const nextPage = count > offset + limit ? pageParam + 1 : null

  return { response: { products, count }, nextPage, queryParams }
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
