import Link from "next/link"
import Image from "next/image"
import { type BlogPost } from "@/components/frontend/blog-cards"
import { Button } from "@/components/frontend/ui/button"
import { apiGet } from "@/lib/api"
import { BLOG_POSTS_API_ENDPOINT, toBlogImageUrl } from "@/lib/blog-endpoints"

type ApiBlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  created_at?: string | null
  cover_image_path: string | null
  seo?: {
    description?: string | null
  } | null
}

type BlogPostsResponse = {
  data: ApiBlogPost[]
}

const fallbackImage = "/images/blog/proxy-types.jpg"

const toBlogPost = (post: ApiBlogPost): BlogPost => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  seo_description: post.excerpt ?? post.seo?.description ?? "",
  featured_image: toBlogImageUrl(post.cover_image_path),
  published_at: post.published_at ?? post.created_at ?? new Date().toISOString(),
})

export async function LatestBlogPostsSection() {
  let posts: BlogPost[] = []

  try {
    const response = await apiGet<BlogPostsResponse>(`${BLOG_POSTS_API_ENDPOINT}?per_page=4&page=1`)
    posts = (response.data ?? []).map(toBlogPost)
  } catch {
    posts = []
  }

  if (!posts.length) {
    return null
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-primary font-medium mb-4">Latest Insights</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            From the GoProxy Blog
          </h2>
          <p className="text-muted-foreground text-lg">
            Fresh guides, technical explainers, and proxy best practices from our team.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition hover:border-primary/40"
            >
              <div className="flex flex-col sm:flex-row">
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block h-56 w-full sm:h-auto sm:w-56 sm:min-w-56"
                >
                  <Image
                    src={post.featured_image || fallbackImage}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 224px"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {post.seo_description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-5 w-fit rounded-full border-border bg-transparent text-sm"
                  >
                    <Link href={`/blog/${post.slug}`}>Read More</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild className="rounded-full px-8">
            <Link href="/blog">More Blog Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
