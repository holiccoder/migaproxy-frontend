import type { Metadata } from "next";
import Link from "next/link";
import { BlogCards, type BlogPost } from "@/components/frontend/blog-cards";
import { BlogPagination } from "@/components/frontend/blog-pagination";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { PillButtons } from "@/components/frontend/pill-buttons";
import { apiGet } from "@/lib/api";
import { BLOG_POSTS_API_ENDPOINT, toBlogImageUrl } from "@/lib/blog-endpoints";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.blog);

export const dynamic = "force-dynamic";

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

const toBlogPost = (post: ApiBlogPost): BlogPost => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  seo_description: post.excerpt ?? post.seo?.description ?? "",
  featured_image: toBlogImageUrl(post.cover_image_path),
  published_at: post.published_at ?? post.created_at ?? new Date().toISOString(),
})

type BlogPageProps = {
  searchParams?: Promise<{ page?: string; per_page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams?.page ?? "1") || 1
  const perPage = Number(resolvedSearchParams?.per_page ?? "9") || 9

  let hasFetchError = false
  let response: BlogPostsResponse = {
    data: [],
    meta: {
      current_page: page,
      last_page: page,
    },
  }

  try {
    response = await apiGet<BlogPostsResponse>(
      `${BLOG_POSTS_API_ENDPOINT}?per_page=${perPage}&page=${page}`,
    )
  } catch {
    hasFetchError = true
  }

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
          {hasFetchError ? (
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Blog posts are temporarily unavailable. Please try again soon.
            </p>
          ) : null}
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
