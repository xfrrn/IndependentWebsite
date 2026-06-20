export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, handle, description, metadata, parentId, isActive } = body

  if (!name || !handle) {
    return NextResponse.json({ message: "name and handle are required" }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: {
      name,
      handle,
      description: description || null,
      metadata: metadata || {},
      parentId: parentId || null,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json({ category }, { status: 201 })
}
