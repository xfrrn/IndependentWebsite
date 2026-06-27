import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
}

function numberParam(value: string | null, fallback: number) {
  const parsed = parseInt(value || "", 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = Math.min(Math.max(numberParam(searchParams.get("limit"), 12), 1), 48)
  const offset = Math.max(numberParam(searchParams.get("offset"), 0), 0)
  const handle = searchParams.get("handle")
  const ids = searchParams.getAll("id")
  const categoryId = searchParams.get("category_id")
  const q = searchParams.get("q")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "published" }
  if (handle) where.handle = handle
  if (ids.length) where.id = { in: ids }
  if (categoryId) where.categories = { some: { categoryId } }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { handle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [products, count] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: true,
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ])

  const nextPage = offset + limit < count ? offset + limit : null

  return NextResponse.json(
    {
      products: products.map(formatProduct),
      count,
      offset,
      limit,
      next: nextPage,
    },
    { headers: CACHE_HEADERS }
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProduct(p: any) {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    thumbnail: p.thumbnail,
    images: p.images,
    options: formatProductOptions(p.variants),
    metadata: p.metadata,
    tags: p.tags,
    status: p.status,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    variants: p.variants.map(formatVariant),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories: p.categories?.map((pc: any) => formatCategory(pc.category)) ?? [],
    collection: p.collections?.[0]?.collection ? formatCollection(p.collections[0].collection) : undefined,
  }
}

// ponytail: lite stores variant options as plain JSON; derive selectors here unless a real option table is added.
function formatProductOptions(variants: Array<{ options: unknown }>) {
  const valuesByOption = new Map<string, Set<string>>()

  variants.forEach((variant) => {
    if (!variant.options || Array.isArray(variant.options) || typeof variant.options !== "object") {
      return
    }

    Object.entries(variant.options).forEach(([key, value]) => {
      if (!valuesByOption.has(key)) {
        valuesByOption.set(key, new Set())
      }
      valuesByOption.get(key)!.add(String(value))
    })
  })

  return Array.from(valuesByOption.entries()).map(([id, values]) => ({
    id,
    title: id,
    values: Array.from(values).map((value) => ({ value })),
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatVariant(v: any) {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku,
    inventory_quantity: v.inventoryQuantity,
    calculated_price: v.calculatedPrice,
    images: v.images,
    options: v.options,
    metadata: v.metadata,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCategory(c: any): Record<string, any> {
  return {
    id: c.id,
    name: c.name,
    handle: c.handle,
    description: c.description,
    metadata: c.metadata,
    is_active: c.isActive,
    parent_category: c.parent ? formatCategory(c.parent) : null,
    category_children: c.children?.map(formatCategory) ?? [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCollection(c: any) {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
  }
}
