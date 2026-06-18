import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

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
        cache: "no-store",
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
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
