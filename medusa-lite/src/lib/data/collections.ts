"use server"

import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"
import { StoreCollection } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

export const retrieveCollection = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/collections/${id}`, {
    next: getCatalogCacheOptions([CACHE_TAGS.collections, `${CACHE_TAGS.collections}-${id}`]),
    cache: "force-cache",
  })
  const { collection } = await res.json()
  return collection as StoreCollection
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  const params = new URLSearchParams(queryParams)
  const res = await fetch(`${API_BASE}/api/collections?${params}`, {
    next: getCatalogCacheOptions(CACHE_TAGS.collections),
    cache: "force-cache",
  })

  const { collections } = await res.json()
  return { collections, count: collections.length }
}

export const getCollectionByHandle = async (handle: string): Promise<StoreCollection> => {
  const params = new URLSearchParams({ handle })
  const res = await fetch(`${API_BASE}/api/collections?${params}`, {
    next: getCatalogCacheOptions(CACHE_TAGS.collections),
    cache: "force-cache",
  })

  const { collections } = await res.json()
  return collections[0]
}
