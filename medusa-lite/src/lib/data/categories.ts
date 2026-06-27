import { unstable_cache } from "next/cache"
import { StoreProductCategory } from "@/lib/types"
import { prisma } from "@/lib/db"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "./cache"

const listCategoriesCached = unstable_cache(
  async (query: Record<string, string> = {}) => {
    const limit = query?.limit || 100
    const handle = query?.handle

    const categories = await prisma.category.findMany({
      where: { isActive: true, ...(handle ? { handle } : {}) },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { rank: "asc" },
      take: Number(limit),
    })

    return categories.map(formatCategory)
  },
  ["list-categories"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.categories] }
)

export const listCategories = async (query?: Record<string, string>) => {
  return listCategoriesCached(query ?? {})
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = categoryHandle.join("/")

  const productCategories = await listCategories({ handle })
  return productCategories[0] as StoreProductCategory
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCategory(category: any): StoreProductCategory {
  return {
    id: category.id,
    name: category.name,
    handle: category.handle,
    description: category.description,
    metadata: category.metadata,
    is_active: category.isActive,
    rank: category.rank,
    parent_category: category.parent ? formatCategory(category.parent) : null,
    category_children: category.children?.map(formatCategory) ?? [],
    products: [],
  }
}
