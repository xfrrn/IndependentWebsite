export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")
  const handle = searchParams.get("handle")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true }
  if (handle) where.handle = handle

  const categories = await prisma.category.findMany({
    where,
    include: {
      parent: true,
      children: true,
      products: { include: { product: { include: { variants: true } } } },
    },
    orderBy: { rank: "asc" },
    take: limit,
    skip: offset,
  })

  // Also fetch all categories for full hierarchy
  const allCategories = await prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { rank: "asc" },
  })

  const catMap = new Map(allCategories.map((c) => [c.id, c]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatCategory(c: any): any {
    const full = catMap.get(c.id) || c
    return {
      id: full.id,
      name: full.name,
      handle: full.handle,
      description: full.description,
      metadata: full.metadata,
      is_active: full.isActive,
      parent_category: full.parent ? formatCategory(full.parent) : null,
      category_children: full.children?.map(formatCategory) ?? [],
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

  return NextResponse.json({
    product_categories: categories.map(formatCategory),
    count: categories.length,
    offset,
    limit,
  })
}
