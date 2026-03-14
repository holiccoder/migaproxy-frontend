import Link from "next/link"
import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { BlogCards, type BlogPost } from "@/components/frontend/blog-cards"
import { PillButtons } from "@/components/frontend/pill-buttons"
import { BlogPagination } from "@/components/frontend/blog-pagination"
import { ENV } from "@/config/env"
import { apiGet } from "@/lib/api"

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
  meta: {
    current_page: number
    last_page: number
  }
}

const toImageUrl = (coverImagePath: string | null): string | null => {
  if (!coverImagePath) {
    return null
  }

  if (coverImagePath.startsWith("http://") || coverImagePath.startsWith("https://")) {
    return coverImagePath
  }

  return `${ENV.API_BASE_URL}/storage/${coverImagePath.replace(/^\/+/, "")}`
}

const toBlogPost = (post: ApiBlogPost): BlogPost => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  seo_description: post.excerpt ?? post.seo?.description ?? "",
  featured_image: toImageUrl(post.cover_image_path),
  published_at: post.published_at ?? post.created_at ?? new Date().toISOString(),
})

type BlogPageProps = {
  searchParams?: { page?: string; per_page?: string }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Number(searchParams?.page ?? "1") || 1
  const perPage = Number(searchParams?.per_page ?? "9") || 9
  const response = await apiGet<BlogPostsResponse>(
    `v1/posts?per_page=${perPage}&page=${page}`,
  )
  const posts = (response.data ?? []).map(toBlogPost)

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="relative">
        <div
          className="absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(56, 189, 248, 0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              GoProxy
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Blog</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              GoProxy Blog
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10">
              A one-stop hub for proxy insights, industry trends, best
              practices, and how-to guides built for teams that ship with speed
              and scale.
            </p>

            <div className="relative">
              <input
                type="search"
                placeholder="Search GoProxy Blog"
                className="mx-auto w-full max-w-2xl rounded-full border border-border bg-card/70 px-6 py-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-28">
          <div className="mb-8 flex justify-center">
            <PillButtons />
          </div>
          <BlogCards posts={posts} />
          <div className="mt-10">
            <BlogPagination
              currentPage={response.meta?.current_page ?? page}
              lastPage={response.meta?.last_page ?? page}
              perPage={perPage}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
