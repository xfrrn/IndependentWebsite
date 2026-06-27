import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const includeProducts = request.nextUrl.searchParams.get("include_products") !== "0"

  const category = await prisma.category.findUnique({
    where: { handle },
    include: {
      parent: true,
      children: true,
      products: includeProducts
        ? { include: { product: { include: { variants: true } } } }
        : false,
    },
  })

  if (!category) {
    return NextResponse.json(
      { message: "Category not found" },
      { status: 404, headers: CACHE_HEADERS }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatCategory(c: any): any {
    return {
      id: c.id,
      name: c.name,
      handle: c.handle,
      description: c.description,
      metadata: c.metadata,
      is_active: c.isActive,
      parent_category: c.parent ? formatCategory(c.parent) : null,
      category_children: c.children?.map(formatCategory) ?? [],
      products: c.products?.map((pc: any) => ({
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
        variants: pc.product.variants?.map((v: any) => ({
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
    }
  }

  return NextResponse.json(
    {
      product_category: formatCategory(category),
    },
    { headers: CACHE_HEADERS }
  )
}
