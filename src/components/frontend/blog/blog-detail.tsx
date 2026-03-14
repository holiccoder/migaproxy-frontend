"use client"

import { useEffect, useRef, useState } from "react"
import { Facebook, Linkedin, Link2, Twitter } from "lucide-react"

type Heading = {
  id: string
  label: string
  level: "h2" | "h3"
}

type BlogDetailProps = {
  title: string
  description: string
  publishedAt: string
  category?: string
  author?: string
  contentHtml: string
}

const socialLinks = [
  { label: "Copy Link", icon: Link2, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "Facebook", icon: Facebook, href: "#" },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function BlogDetail({
  title,
  description,
  publishedAt,
  category,
  author,
  contentHtml,
}: BlogDetailProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    if (!contentRef.current) return

    const elements = Array.from(
      contentRef.current.querySelectorAll("h2, h3"),
    ) as HTMLHeadingElement[]

    const extracted: Heading[] = elements.map((el, index) => {
      let id = el.id
      if (!id) {
        id = `${slugify(el.textContent || "section")}-${index}`
        el.id = id
      }
      return {
        id,
        label: el.textContent || `Section ${index + 1}`,
        level: el.tagName.toLowerCase() as "h2" | "h3",
      }
    })

    setHeadings(extracted)
    setActiveId(extracted[0]?.id ?? "")
  }, [contentHtml])

  useEffect(() => {
    if (!headings.length) return

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!headingElements.length) return

    const topOffset = 140
    let ticking = false

    const updateActiveHeading = () => {
      ticking = false

      const current = headingElements.reduce<HTMLElement | null>((found, el) => {
        if (el.getBoundingClientRect().top - topOffset <= 0) {
          return el
        }
        return found
      }, null)

      const nextId = current?.id ?? headingElements[0]?.id ?? ""
      setActiveId((prev) => (prev === nextId ? prev : nextId))
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(updateActiveHeading)
    }

    updateActiveHeading()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [headings])

  return (
    <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative">
          <div className="hidden lg:flex flex-col gap-3 absolute -left-14 top-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition hover:text-foreground hover:border-primary/50"
              >
                <link.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <article className="space-y-8 rounded-2xl border border-border bg-card/70 p-6 lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">
                {category ?? "Blog"}
              </p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground">
                {title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
                {author ? ` • ${author}` : ""}
              </div>
            </div>

            <div
              ref={contentRef}
              className="space-y-4 text-muted-foreground [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:scroll-mt-28 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-foreground [&_h5]:font-semibold [&_h5]:text-foreground [&_h6]:font-semibold [&_h6]:text-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:rounded-xl [&_pre]:bg-background/60 [&_pre]:p-4 [&_code]:text-sm"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-border bg-card/70 p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Table of Contents
          </h2>
          <nav className="space-y-2 text-sm">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`block transition-colors ${
                  heading.level === "h3" ? "pl-4 text-muted-foreground" : ""
                } ${
                  activeId === heading.id
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {heading.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </section>
  )
}
