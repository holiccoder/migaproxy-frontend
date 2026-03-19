"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type HelpArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  callout?: {
    type: "note" | "warning" | "tip";
    title: string;
    content: string;
  } | null;
  codeBlock?: {
    language: string;
    code: string;
  } | null;
};

type HelpArticle = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: {
    slug: string;
    title: string;
  } | null;
  sections: HelpArticleSection[];
  related_articles: Array<{
    slug: string;
    title: string;
    description: string;
  }>;
};

type HelpArticleResponse = {
  data?: HelpArticle;
};

const calloutClassByType: Record<string, string> = {
  note: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
  warning:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200",
  tip: "border-success-200 bg-success-50 text-success-800 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-200",
};

export default function HelpCenterArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [activeSection, setActiveSection] = useState<string>("");
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setErrorMessage("Article not found.");
      setIsLoading(false);
      return;
    }

    const fetchArticle = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetch(
          `/api/v1/help-center/articles/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          setErrorMessage("Article not found.");
          setArticle(null);
          return;
        }

        const payload = (await response.json()) as HelpArticleResponse;
        setArticle(payload.data ?? null);
      } catch {
        setErrorMessage("Unable to load article.");
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchArticle();
  }, [slug]);

  const relatedArticles = useMemo(() => {
    if (!article) {
      return [];
    }

    return article.related_articles;
  }, [article]);

  const displayedActiveSection = activeSection || article?.sections[0]?.id || "";

  useEffect(() => {
    if (!article || article.sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryA.boundingClientRect.top - entryB.boundingClientRect.top)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.2, 0.4, 0.8],
      }
    );

    article.sections.forEach((section) => {
      const element = document.getElementById(section.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [article]);

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Help Center" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
          Loading article...
        </div>
      </div>
    );
  }

  if (!article || errorMessage) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Help Center" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-error-500 dark:border-gray-800 dark:bg-white/[0.03]">
          {errorMessage ?? "Article not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Help Center" />

      <div className="mb-4">
        <Link href="/user/help-center" className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Back to Help Center
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="xl:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">On this page</h3>
            <nav className="mt-3 space-y-1">
              {article.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block rounded-md px-2 py-1 text-sm transition ${
                    displayedActiveSection === section.id
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="xl:col-span-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{article.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{article.description}</p>

          <div className="mt-8 space-y-10">
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{section.title}</h2>
                <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>

                {section.callout ? (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm ${calloutClassByType[section.callout.type] ?? calloutClassByType.note}`}
                  >
                    <p className="font-semibold">{section.callout.title}</p>
                    <p className="mt-1">{section.callout.content}</p>
                  </div>
                ) : null}

                {section.codeBlock ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-800 bg-[#0f172a]">
                    <div className="border-b border-slate-700 px-4 py-2 text-xs uppercase tracking-wider text-slate-300">
                      {section.codeBlock.language}
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-100">
                      <code>{section.codeBlock.code}</code>
                    </pre>
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">Was this article helpful?</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFeedback("yes");
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  feedback === "yes"
                    ? "border-success-500 bg-success-500 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedback("no");
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  feedback === "no"
                    ? "border-error-500 bg-error-500 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                No
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Still need help? Our support team can help you resolve this quickly.
              </p>
              <Link
                href="/user/tickets"
                className="inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Open a Ticket
              </Link>
            </div>
          </div>
        </article>

        <aside className="xl:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Related Articles</h3>
            <div className="mt-3 space-y-2">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.slug}
                  href={`/user/help-center/${relatedArticle.slug}`}
                  className="block rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-brand-300 hover:text-brand-500 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
                >
                  {relatedArticle.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
