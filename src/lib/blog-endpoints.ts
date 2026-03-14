import { ENV } from "@/config/env"

const BLOG_ORIGIN = ENV.API_BASE_URL

export const BLOG_POSTS_API_ENDPOINT = `${BLOG_ORIGIN}/api/v1/posts`

export const toBlogImageUrl = (coverImagePath: string | null): string | null => {
  if (!coverImagePath) {
    return null
  }

  if (coverImagePath.startsWith("http://") || coverImagePath.startsWith("https://")) {
    return coverImagePath
  }

  return `${BLOG_ORIGIN}/storage/${coverImagePath.replace(/^\/+/, "")}`
}
