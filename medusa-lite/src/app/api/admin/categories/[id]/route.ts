export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      metadata: body.metadata,
      isActive: body.isActive,
      parentId: body.parentId,
    },
  })

  return NextResponse.json({ category })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
