type ProductLike = {
  title?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

function metadataString(product: ProductLike, key: string) {
  const value = product.metadata?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export function getLocalizedProductTitle(
  product: ProductLike,
  locale?: string | null
) {
  const normalized = locale?.toLowerCase().replace("_", "-") ?? ""

  if (normalized.startsWith("zh")) {
    return metadataString(product, "title_zh") ?? product.title ?? ""
  }

  if (normalized.startsWith("ar")) {
    return metadataString(product, "title_ar") ?? product.title ?? ""
  }

  return product.title ?? ""
}

export function getLocalizedProductDescription(
  product: ProductLike,
  locale?: string | null
) {
  const normalized = locale?.toLowerCase().replace("_", "-") ?? ""

  if (normalized.startsWith("zh")) {
    return metadataString(product, "description_zh") ?? product.description ?? ""
  }

  if (normalized.startsWith("ar")) {
    return metadataString(product, "description_ar") ?? product.description ?? ""
  }

  return product.description ?? ""
}
