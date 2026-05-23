import { HttpTypes } from "@medusajs/types"

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/\+/, "plus")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim()
}

export function getMetadataString(
  product: HttpTypes.StoreProduct,
  key: string
): string | null {
  const value = product.metadata?.[key]
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return null
}

export function splitTokens(value: string | null): string[] {
  if (!value) return []
  return value
    .split(/,|\||\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getAgeRange(product: HttpTypes.StoreProduct) {
  return getMetadataString(product, "age_range")
}

export function getToyType(product: HttpTypes.StoreProduct) {
  return getMetadataString(product, "toy_type")
}

export function getHighlight(product: HttpTypes.StoreProduct) {
  return getMetadataString(product, "highlight")
}

export function getSkills(product: HttpTypes.StoreProduct): string[] {
  return splitTokens(getMetadataString(product, "skills"))
}

export function getTagValues(product: HttpTypes.StoreProduct): string[] {
  return product.tags?.map((tag) => tag.value).filter(Boolean) ?? []
}

export function normalizeAgeRange(value: string) {
  return normalize(value)
}

type AgeBucket = {
  slug: string
  minMonths: number
  maxMonths: number | null
}

export const AGE_BUCKETS: AgeBucket[] = [
  { slug: "0-24-months", minMonths: 0, maxMonths: 24 },
  { slug: "2-4-years", minMonths: 24, maxMonths: 48 },
  { slug: "5-7-years", minMonths: 60, maxMonths: 84 },
  { slug: "8-10-years", minMonths: 96, maxMonths: 120 },
  { slug: "11-13-years", minMonths: 132, maxMonths: 156 },
  { slug: "14-plus-years", minMonths: 168, maxMonths: null },
]

function parseAgeRangeToMonths(value: string) {
  const lower = value.toLowerCase().trim()
  const normalized = normalize(value)
  const numbers = normalized.match(/\d+/g)?.map(Number) ?? []

  if (numbers.length === 0) {
    return null
  }

  const isMonths =
    lower.includes("month") ||
    lower.includes("months") ||
    lower.includes("mos") ||
    /m$/.test(normalized)

  if (numbers.length === 1) {
    const min = isMonths ? numbers[0] : numbers[0] * 12
    const max = normalized.includes("plus") ? null : min
    return { minMonths: min, maxMonths: max }
  }

  const [minValue, maxValue] = numbers

  return {
    minMonths: isMonths ? minValue : minValue * 12,
    maxMonths: isMonths ? maxValue : maxValue * 12,
  }
}

function rangesOverlap(
  a: { minMonths: number; maxMonths: number | null },
  b: { minMonths: number; maxMonths: number | null }
) {
  const aMax = a.maxMonths ?? Number.POSITIVE_INFINITY
  const bMax = b.maxMonths ?? Number.POSITIVE_INFINITY

  return a.minMonths <= bMax && b.minMonths <= aMax
}

export function matchesAgeRange(product: HttpTypes.StoreProduct, slug: string) {
  const raw = getMetadataString(product, "age_range")
  if (!raw) return false

  const normalizedSlug = normalize(slug)
  if (normalize(raw) === normalizedSlug) {
    return true
  }

  const bucket = AGE_BUCKETS.find((item) => item.slug === normalizedSlug)
  const parsedRange = parseAgeRangeToMonths(raw)

  if (!bucket || !parsedRange) {
    return false
  }

  return rangesOverlap(parsedRange, bucket)
}

export function matchesCategoryKey(product: HttpTypes.StoreProduct, slug: string) {
  const raw = getMetadataString(product, "category_key")
  if (!raw) return false
  return normalize(raw) === normalize(slug)
}

export function matchesScenarioKey(product: HttpTypes.StoreProduct, slug: string) {
  const raw = getMetadataString(product, "scenario_key")
  const rawList = getMetadataString(product, "scenario_keys")

  const normalizedSlug = normalize(slug)

  if (raw && normalize(raw) === normalizedSlug) {
    return true
  }

  if (rawList) {
    const tokens = splitTokens(rawList).map(normalize)
    return tokens.includes(normalizedSlug)
  }

  return false
}
