import Link from "next/link"
import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { BlogDetail } from "@/components/frontend/blog/blog-detail"
import { apiGet } from "@/lib/api"
import { notFound } from "next/navigation"

type BlogDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

type BlogDetailResponse = {
  data: {
    id: number
    title: string
    excerpt: string | null
    body: string | null
    published_at: string | null
    created_at?: string | null
    categories?: Array<{ name: string }> | null
    seo?: {
      description?: string | null
      author?: string | null
    } | null
  }
}

const toContentHtml = (value: string | null): string => {
  if (!value) {
    return "<p>No content available.</p>"
  }

  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("")
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const response = await apiGet<BlogDetailResponse>(
    `v1/posts/${encodeURIComponent(slug)}`,
  ).catch(() => null)

  if (!response?.data) {
    notFound()
  }

  const post = response.data

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-10 lg:pt-36">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            GoProxy
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>
      </section>
      <BlogDetail
        title={post.title}
        description={post.seo?.description ?? post.excerpt ?? ""}
        publishedAt={post.published_at ?? post.created_at ?? new Date().toISOString()}
        category={post.categories?.[0]?.name}
        author={post.seo?.author ?? undefined}
        contentHtml={toContentHtml(post.body)}
      />
      <Footer />
    </main>
  )
}
