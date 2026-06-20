import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value
    if (!cacheId) return ""
    return `${tag}-${cacheId}`
  } catch {
    return ""
  }
}

export const getCacheOptions = async (tag: string) => {
  if (typeof window !== "undefined") return {}
  const cacheTag = await getCacheTag(tag)
  if (!cacheTag) return {}
  return { tags: [`${cacheTag}`] }
}
