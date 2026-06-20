export const CACHE_REVALIDATE_SECONDS = 300

export const CACHE_TAGS = {
  categories: "catalog-categories",
  collections: "catalog-collections",
  products: "catalog-products",
  regions: "catalog-regions",
  siteContent: "site-content",
}

export function getCatalogCacheOptions(tags: string | string[]) {
  return {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: Array.isArray(tags) ? tags : [tags],
  }
}
