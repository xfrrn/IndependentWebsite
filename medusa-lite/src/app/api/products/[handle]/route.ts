import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  const product = await prisma.product.findUnique({
    where: { handle },
    include: {
      variants: true,
      categories: { include: { category: true } },
      collections: { include: { collection: true } },
    },
  })

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404, headers: CACHE_HEADERS }
    )
  }

  return NextResponse.json(
    {
      product: {
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
        variants: product.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          inventory_quantity: v.inventoryQuantity,
          calculated_price: v.calculatedPrice,
          images: v.images,
          options: v.options,
          metadata: v.metadata,
        })),
        categories: product.categories?.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          handle: pc.category.handle,
          description: pc.category.description,
          metadata: pc.category.metadata,
          is_active: pc.category.isActive,
        })) ?? [],
        collection: product.collections?.[0]?.collection
          ? { id: product.collections[0].collection.id, title: product.collections[0].collection.title, handle: product.collections[0].collection.handle }
          : undefined,
      },
    },
    { headers: CACHE_HEADERS }
  )
}
