import { listRegions } from "./regions"

export async function getDefaultCountryCode() {
  const regions = await listRegions()
  return regions[0]?.countries?.[0]?.iso_2 ?? "gb"
}
