"use server"

import { StoreCollection } from "@/lib/types"
import { prisma } from "@/lib/db"

export const retrieveCollection = async (id: string) => {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: { include: { product: { include: { variants: true } } } },
    },
  })
  return collection ? formatCollection(collection) : null
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: StoreCollection[]; count: number }> => {
  const limit = Number(queryParams.limit || "100")
  const offset = Number(queryParams.offset || "0")
  const handle = queryParams.handle
  const where = handle ? { handle } : {}

  const [collections, count] = await Promise.all([
    prisma.collection.findMany({
      where,
      include: {
        products: { include: { product: { include: { variants: true } } } },
      },
      take: limit,
      skip: offset,
    }),
    prisma.collection.count({ where }),
  ])

  return { collections: collections.map(formatCollection), count }
}

export const getCollectionByHandle = async (handle: string): Promise<StoreCollection> => {
  const collection = await prisma.collection.findUnique({
    where: { handle },
    include: {
      products: { include: { product: { include: { variants: true } } } },
    },
  })

  return collection ? formatCollection(collection) : (null as unknown as StoreCollection)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCollection(collection: any): StoreCollection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    products:
      collection.products?.map((pc: any) => ({
        id: pc.product.id,
        handle: pc.product.handle,
        title: pc.product.title,
        subtitle: pc.product.subtitle,
        description: pc.product.description,
        thumbnail: pc.product.thumbnail,
        images: pc.product.images,
        metadata: pc.product.metadata,
        tags: pc.product.tags,
        status: pc.product.status,
        created_at: pc.product.createdAt?.toISOString(),
        updated_at: pc.product.updatedAt?.toISOString(),
        variants:
          pc.product.variants?.map((variant: any) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            inventory_quantity: variant.inventoryQuantity,
            calculated_price: variant.calculatedPrice,
            images: variant.images,
            options: variant.options,
            metadata: variant.metadata,
          })) ?? [],
      })) ?? [],
  }
}
