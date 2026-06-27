"use server"

import { unstable_cache } from "next/cache"
import { StoreCollection, StoreProduct, StoreProductVariant } from "@/lib/types"
import { prisma } from "@/lib/db"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "./cache"

const collectionCacheOptions = {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.collections, CACHE_TAGS.products],
}

export const retrieveCollection = unstable_cache(async (id: string) => {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: { include: { product: { include: { variants: true } } } },
    },
  })
  return collection ? formatCollection(collection) : null
}, ["retrieve-collection"], collectionCacheOptions)

const listCollectionsCached = unstable_cache(async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: StoreCollection[]; count: number }> => {
  const limit = Number(queryParams.limit || "100")
  const offset = Number(queryParams.offset || "0")
  const handle = queryParams.handle
  const where = handle ? { handle } : {}

  const [collections, count] = await Promise.all([
    prisma.collection.findMany({
      where,
      take: limit,
      skip: offset,
    }),
    prisma.collection.count({ where }),
  ])

  return { collections: collections.map(formatCollection), count }
}, ["list-collections"], collectionCacheOptions)

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: StoreCollection[]; count: number }> => {
  return listCollectionsCached(queryParams)
}

export const getCollectionByHandle = unstable_cache(async (handle: string): Promise<StoreCollection> => {
  const collection = await prisma.collection.findUnique({
    where: { handle },
    include: {
      products: { include: { product: { include: { variants: true } } } },
    },
  })

  return collection ? formatCollection(collection) : (null as unknown as StoreCollection)
}, ["collection-by-handle"], collectionCacheOptions)

type CollectionProductRow = {
  product: {
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
    variants?: {
      id: string
      title: string
      sku: string | null
      inventoryQuantity: number
      calculatedPrice: unknown
      images: unknown
      options: unknown
      metadata: unknown
    }[]
  }
}

type CollectionRow = {
  id: string
  title: string
  handle: string | null
  products?: CollectionProductRow[]
}

function formatCollection(collection: CollectionRow): StoreCollection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    products:
      collection.products?.map((pc) => ({
        id: pc.product.id,
        handle: pc.product.handle,
        title: pc.product.title,
        subtitle: pc.product.subtitle,
        description: pc.product.description,
        thumbnail: pc.product.thumbnail,
        images: pc.product.images as StoreProduct["images"],
        metadata: pc.product.metadata as StoreProduct["metadata"],
        tags: pc.product.tags as StoreProduct["tags"],
        status: pc.product.status,
        created_at: pc.product.createdAt?.toISOString(),
        updated_at: pc.product.updatedAt?.toISOString(),
        variants:
          pc.product.variants?.map((variant) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            inventory_quantity: variant.inventoryQuantity,
            calculated_price: variant.calculatedPrice as StoreProductVariant["calculated_price"],
            images: variant.images as StoreProductVariant["images"],
            options: variant.options as StoreProductVariant["options"],
            metadata: variant.metadata as StoreProductVariant["metadata"],
          })) ?? [],
      })) ?? [],
  }
}
