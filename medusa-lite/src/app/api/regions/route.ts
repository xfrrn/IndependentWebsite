import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET() {
  const regions = await prisma.region.findMany()
  return NextResponse.json(
    {
      regions: regions.map((r) => ({
        id: r.id,
        name: r.name,
        currency_code: r.currencyCode,
        countries: r.countries as { iso_2: string; iso_3?: string; name: string; display_name?: string }[],
        automatic_taxes: r.automaticTaxes,
      })),
    },
    { headers: CACHE_HEADERS }
  )
}
