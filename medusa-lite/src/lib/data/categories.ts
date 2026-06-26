import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"
import { StoreProductCategory } from "@/lib/types"
import { getInternalBaseURL } from "@lib/util/env"

const API_BASE = getInternalBaseURL()

export const listCategories = async (query?: Record<string, string>) => {
  const limit = query?.limit || 100

  const params = new URLSearchParams({ limit: String(limit), ...query })

  const res = await fetch(`${API_BASE}/api/categories?${params}`, {
    next: getCatalogCacheOptions(CACHE_TAGS.categories),
    cache: "force-cache",
  })

  const { product_categories } = await res.json()
  return product_categories as StoreProductCategory[]
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = categoryHandle.join("/")

  const params = new URLSearchParams({ handle })
  const res = await fetch(`${API_BASE}/api/categories?${params}`, {
    cache: "no-store",
  })

  const { product_categories } = await res.json()
  return product_categories[0] as StoreProductCategory
}
