import { toRelativeApiUrl } from "@/config/env"

export const BLOG_POSTS_API_ENDPOINT = "/api/v1/posts"

export const toBlogImageUrl = (coverImagePath: string | null): string | null => {
  if (!coverImagePath) {
    return null
  }

  if (coverImagePath.startsWith("http://") || coverImagePath.startsWith("https://")) {
    return toRelativeApiUrl(coverImagePath)
  }

  const normalizedPath = coverImagePath.replace(/^\/+/, "")

  if (normalizedPath.startsWith("storage/")) {
    return `/${normalizedPath}`
  }

  return `/storage/${normalizedPath}`
}
