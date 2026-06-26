"use server"

import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"
import { StoreRegion } from "@/lib/types"
import { getInternalBaseURL } from "@lib/util/env"

const API_BASE = getInternalBaseURL()

export const listRegions = async () => {
  const res = await fetch(`${API_BASE}/api/regions`, {
    method: "GET",
    next: getCatalogCacheOptions(CACHE_TAGS.regions),
    cache: "force-cache",
  })
  const { regions } = await res.json()
  return regions as StoreRegion[]
}

export const retrieveRegion = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/regions/${id}`, {
    method: "GET",
    next: getCatalogCacheOptions([CACHE_TAGS.regions, `${CACHE_TAGS.regions}-${id}`]),
    cache: "force-cache",
  })
  const { region } = await res.json()
  return region as StoreRegion
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
