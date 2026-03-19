import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { getCmsPageBySlug } from "@/lib/cms-pages";
import { createPageMetadata } from "@/lib/seo/page-seo";

type CmsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getCmsPage = cache(async (slug: string) => {
  return getCmsPageBySlug(slug);
});

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  if (!page) {
    return createPageMetadata({
      title: "Page Not Found | GoProxy",
      description: "The requested page could not be found.",
      path: `/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: page.seo?.title?.trim() || page.title,
    description:
      page.seo?.description?.trim() || `Learn more about ${page.title} on GoProxy.`,
    path: `/${encodeURIComponent(slug)}`,
  });
}

export const dynamic = "force-dynamic";

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  if (!page) {
    notFound();
  }

  const hasHtmlContent = page.content_html.trim().length > 0;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            GoProxy
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        <article className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{page.title}</h1>

          {hasHtmlContent ? (
            <div
              className="mt-6 space-y-4 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:leading-7 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: page.content_html }}
            />
          ) : (
            <p className="mt-6 whitespace-pre-line leading-7 text-muted-foreground">
              {page.content}
            </p>
          )}
        </article>
      </section>
      <Footer />
    </main>
  );
}
