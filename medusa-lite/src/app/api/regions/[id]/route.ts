export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const region = await prisma.region.findUnique({ where: { id } })
  if (!region) {
    return NextResponse.json({ message: "Region not found" }, { status: 404 })
  }
  return NextResponse.json({
    region: {
      id: region.id,
      name: region.name,
      currency_code: region.currencyCode,
      countries: region.countries as { iso_2: string; iso_3?: string; name: string; display_name?: string }[],
      automatic_taxes: region.automaticTaxes,
    },
  })
}
