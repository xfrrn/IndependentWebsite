"use server"

import { unstable_cache } from "next/cache"
import { StoreRegion } from "@/lib/types"
import { prisma } from "@/lib/db"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "./cache"

const listRegionsCached = unstable_cache(async () => {
  const regions = await prisma.region.findMany()
  return regions.map(formatRegion)
}, ["list-regions"], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.regions],
})

export const listRegions = async () => listRegionsCached()

const retrieveRegionCached = unstable_cache(async (id: string) => {
  const region = await prisma.region.findUnique({ where: { id } })
  return region ? formatRegion(region) : null
}, ["retrieve-region"], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.regions],
})

export const retrieveRegion = async (id: string) => retrieveRegionCached(id)

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
