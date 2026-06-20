export * from "@/lib/types"

// Re-export as HttpTypes for files that use HttpTypes.StoreProduct
import * as Types from "@/lib/types"

export const HttpTypes = {
  StoreProduct: null as unknown as Types.StoreProduct,
  StoreRegion: null as unknown as Types.StoreRegion,
  StoreCollection: null as unknown as Types.StoreCollection,
  StoreProductCategory: null as unknown as Types.StoreProductCategory,
  StoreProductVariant: null as unknown as Types.StoreProductVariant,
}

export type {
  StoreProduct,
  StoreRegion,
  StoreCollection,
  StoreProductCategory,
  StoreProductVariant,
} from "@/lib/types"
