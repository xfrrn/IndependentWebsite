export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      thumbnail: body.thumbnail,
      images: body.images,
      metadata: body.metadata,
      tags: body.tags,
      status: body.status,
    },
    include: { variants: true },
  })

  return NextResponse.json({ product })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
