export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")
  const handle = searchParams.get("handle")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (handle) where.handle = handle

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

  return NextResponse.json({
    collections: collections.map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      products: c.products?.map((pc) => ({
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
        variants: pc.product.variants?.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          inventory_quantity: v.inventoryQuantity,
          calculated_price: v.calculatedPrice,
          images: v.images,
          options: v.options,
          metadata: v.metadata,
        })) ?? [],
      })) ?? [],
    })),
    count,
    offset,
    limit,
  })
}
