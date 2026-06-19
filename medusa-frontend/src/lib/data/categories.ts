import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { CACHE_TAGS, getCatalogCacheOptions } from "./cache"

export const listCategories = async (query?: Record<string, any>) => {
  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: [
            "id",
            "name",
            "handle",
            "description",
            "metadata",
            "*category_children",
            "*products",
            "*parent_category",
            "*parent_category.parent_category",
          ].join(","),
          limit,
          ...query,
        },
        next: getCatalogCacheOptions(CACHE_TAGS.categories),
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: [
            "id",
            "name",
            "handle",
            "description",
            "metadata",
            "*category_children",
            "*products",
          ].join(","),
          handle,
        },
        next: getCatalogCacheOptions(CACHE_TAGS.categories),
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
