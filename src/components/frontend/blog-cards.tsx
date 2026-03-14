import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/frontend/ui/button"
import { cn } from "@/lib/utils"

export type BlogPost = {
  id: number
  title: string
  slug: string
  seo_description: string
  featured_image: string | null
  published_at: string
}

type BlogCardsProps = {
  posts: BlogPost[]
  className?: string
}

const fallbackImage = "/images/blog/proxy-types.jpg"

export function BlogCards({ posts, className }: BlogCardsProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((post) => (
        <article
          key={post.id}
          className="group overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition hover:border-primary/40"
        >
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={post.featured_image || fallbackImage}
                alt={post.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
          <div className="p-6">
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
            <p className="mt-2 text-sm text-muted-foreground">
              {post.seo_description}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-5 rounded-full border-border bg-transparent text-sm"
            >
              <Link href={`/blog/${post.slug}`}>Read More</Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}
