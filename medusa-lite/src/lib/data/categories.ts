import { StoreProductCategory } from "@/lib/types"
import { prisma } from "@/lib/db"

export const listCategories = async (query?: Record<string, string>) => {
  const limit = query?.limit || 100
  const handle = query?.handle

  const categories = await prisma.category.findMany({
    where: { isActive: true, ...(handle ? { handle } : {}) },
    include: {
      parent: true,
      children: true,
      products: { include: { product: { include: { variants: true } } } },
    },
    orderBy: { rank: "asc" },
    take: Number(limit),
  })

  return categories.map(formatCategory)
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
    products:
      category.products?.map((pc: any) => ({
        id: pc.product.id,
        handle: pc.product.handle,
        title: pc.product.title,
        subtitle: pc.product.subtitle,
        description: pc.product.description,
        thumbnail: pc.product.thumbnail,
        images: pc.product.images,
        metadata: pc.product.metadata,
        tags: pc.product.tags,
        status: pc.product.status,
        created_at: pc.product.createdAt?.toISOString(),
        updated_at: pc.product.updatedAt?.toISOString(),
        variants:
          pc.product.variants?.map((variant: any) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            inventory_quantity: variant.inventoryQuantity,
            calculated_price: variant.calculatedPrice,
            images: variant.images,
            options: variant.options,
            metadata: variant.metadata,
          })) ?? [],
      })) ?? [],
  }
}
