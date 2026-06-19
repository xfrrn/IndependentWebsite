"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"

export const retrieveCollection = async (id: string) => {
  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next: getCatalogCacheOptions([
          CACHE_TAGS.collections,
          `${CACHE_TAGS.collections}-${id}`,
        ]),
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next: getCatalogCacheOptions(CACHE_TAGS.collections),
        cache: "force-cache",
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next: getCatalogCacheOptions(CACHE_TAGS.collections),
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}
