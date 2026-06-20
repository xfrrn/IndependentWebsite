export interface StoreProduct {
  id: string
  handle: string
  title: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  images?: { url: string; id?: string }[]
  metadata?: Record<string, string> | null
  tags?: { id: string; value: string }[]
  variants?: StoreProductVariant[]
  categories?: StoreProductCategory[]
  collection?: StoreCollection
  created_at?: string
  updated_at?: string
  status?: string
}

export interface StoreProductVariant {
  id: string
  title: string
  sku?: string | null
  inventory_quantity?: number
  calculated_price?: {
    calculated_amount: number
    original_amount: number
    currency_code: string
    calculated_price?: { price_list_type?: string }
  } | null
  images?: { url: string }[]
  options?: Record<string, string>
  metadata?: Record<string, string> | null
}

export interface StoreProductCategory {
  id: string
  name: string
  handle: string
  description?: string | null
  metadata?: Record<string, string> | null
  parent_category?: StoreProductCategory | null
  category_children?: StoreProductCategory[]
  products?: StoreProduct[]
  is_active?: boolean
  rank?: number
}

export interface StoreCollection {
  id: string
  title: string
  handle?: string | null
  products?: StoreProduct[]
}

export interface StoreRegion {
  id: string
  name: string
  currency_code: string
  countries?: { iso_2: string; iso_3?: string; name: string; display_name?: string }[]
  automatic_taxes?: boolean
}

export interface Locale {
  code: string
  name: string
  direction?: "ltr" | "rtl"
}
