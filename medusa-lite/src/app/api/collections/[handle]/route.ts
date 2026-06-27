import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  const collection = await prisma.collection.findUnique({
    where: { handle },
    include: {
      products: { include: { product: { include: { variants: true } } } },
    },
  })

  if (!collection) {
    return NextResponse.json(
      { message: "Collection not found" },
      { status: 404, headers: CACHE_HEADERS }
    )
  }

  return NextResponse.json(
    {
      collection: {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        products: collection.products?.map((pc) => ({
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
      },
    },
    { headers: CACHE_HEADERS }
  )
}
