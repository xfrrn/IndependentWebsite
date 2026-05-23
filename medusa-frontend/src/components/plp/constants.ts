export const AGE_FILTERS = ["0-12m", "1-2", "3-4", "5-6", "7+"]

export const TYPE_FILTERS = [
  "Educational",
  "Sensory",
  "Wooden",
  "Building",
  "Role play",
]

export const SKILL_FILTERS = [
  "Hand-eye",
  "Fine motor",
  "Logic",
  "Creativity",
  "Sensory play",
]

export const PRICE_FILTERS = [
  { label: "0-99", min: 0, max: 99 },
  { label: "100-199", min: 100, max: 199 },
  { label: "200-399", min: 200, max: 399 },
  { label: "400+", min: 400, max: Number.POSITIVE_INFINITY },
]

export const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
]
