export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, handle, description, thumbnail, images, metadata, tags, categoryIds, variants } = body

  if (!title || !handle) {
    return NextResponse.json({ message: "title and handle are required" }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      handle,
      title,
      subtitle: body.subtitle || null,
      description: description || null,
      thumbnail: thumbnail || null,
      images: images || [],
      metadata: metadata || {},
      tags: tags || [],
      status: body.status || "published",
      weight: body.weight || null,
      categories: categoryIds?.length
        ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
        : undefined,
      variants: variants?.length
        ? {
            createMany: {
              data: variants.map((v: any) => ({
                title: v.title,
                sku: v.sku || null,
                inventoryQuantity: v.inventoryQuantity ?? 0,
                calculatedPrice: v.calculatedPrice || null,
                images: v.images || [],
                options: v.options || {},
                metadata: v.metadata || {},
              })),
            },
          }
        : undefined,
    },
    include: { variants: true, categories: { include: { category: true } } },
  })

  return NextResponse.json({ product }, { status: 201 })
}
