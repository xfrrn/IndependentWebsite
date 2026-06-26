"use server"

import { StoreRegion } from "@/lib/types"
import { prisma } from "@/lib/db"

export const listRegions = async () => {
  const regions = await prisma.region.findMany()
  return regions.map(formatRegion)
}

export const retrieveRegion = async (id: string) => {
  const region = await prisma.region.findUnique({ where: { id } })
  return region ? formatRegion(region) : null
}

const regionMap = new Map<string, StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)!
    }

    const regions = await listRegions()
    if (!regions) return null

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    return regionMap.get(countryCode) ?? null
  } catch {
    return null
  }
}

function formatRegion(region: {
  id: string
  name: string
  currencyCode: string
  countries: unknown
  automaticTaxes: boolean
}): StoreRegion {
  return {
    id: region.id,
    name: region.name,
    currency_code: region.currencyCode,
    countries: Array.isArray(region.countries)
      ? (region.countries as StoreRegion["countries"])
      : [],
    automatic_taxes: region.automaticTaxes,
  }
}
