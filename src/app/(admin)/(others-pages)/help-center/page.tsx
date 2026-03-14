"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type HelpCategory = {
  id: number;
  slug: string;
  icon: string | null;
  title: string;
  description: string | null;
  articles_count: number;
};

type HelpArticleSummary = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: {
    slug: string;
    title: string;
  } | null;
};

type CategoriesResponse = {
  data?: HelpCategory[];
};

type ArticlesResponse = {
  data?: HelpArticleSummary[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

type PopularSearchesResponse = {
  data?: string[];
};

const categoryIconLabel: Record<string, string> = {
  rocket: "R",
  link: "L",
  shield: "S",
  wallet: "W",
};

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticleSummary[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = ENV.API_BASE_URL;

  useEffect(() => {
    const fetchMeta = async (): Promise<void> => {
      try {
        const [categoriesResponse, popularSearchesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/v1/help-center/categories`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`${apiBaseUrl}/api/v1/help-center/popular-searches`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        if (categoriesResponse.ok) {
          const payload = (await categoriesResponse.json()) as CategoriesResponse;
          setCategories(payload.data ?? []);
        }

        if (popularSearchesResponse.ok) {
          const payload = (await popularSearchesResponse.json()) as PopularSearchesResponse;
          setPopularSearches(payload.data ?? []);
        }
      } catch {
        setErrorMessage("Unable to load help center metadata.");
      }
    };

    void fetchMeta();
  }, [apiBaseUrl]);

  useEffect(() => {
    const fetchArticles = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const searchParams = new URLSearchParams();

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }
        if (selectedCategory !== "all") {
          searchParams.set("category", selectedCategory);
        }

        const response = await fetch(
          `${apiBaseUrl}/api/v1/help-center/articles${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          setErrorMessage("Unable to load help center articles.");
          return;
        }

        const payload = (await response.json()) as ArticlesResponse;
        setArticles(payload.data ?? []);
      } catch {
        setErrorMessage("Unable to load help center articles.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchArticles();
  }, [apiBaseUrl, searchQuery, selectedCategory]);

  const filteredArticles = useMemo(() => {
    return articles;
  }, [articles]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Help Center" />

      <section className="rounded-2xl border border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90 lg:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Find answers fast with live search across docs and troubleshooting guides.
          </p>

          <div className="mt-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              placeholder="Search for 'How to setup API' or 'Billing'..."
              className="h-14 w-full rounded-xl border border-gray-300 bg-transparent px-5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {popularSearches.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  setSearchQuery(keyword);
                }}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Categories</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse by topic if you are not sure where to start.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
            }}
            className={`rounded-xl border p-4 text-left transition ${
              selectedCategory === "all"
                ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/60 dark:bg-brand-500/10"
                : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-brand-500/40"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              A
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">All Categories</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Show articles from every category.</p>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.slug}
              onClick={() => {
                setSelectedCategory(category.slug);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                selectedCategory === category.slug
                  ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/60 dark:bg-brand-500/10"
                  : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-brand-500/40"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {category.icon ? categoryIconLabel[category.icon] ?? "?" : "?"}
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">{category.title}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{category.description ?? "-"}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {category.articles_count} articles
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Articles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? "Loading..." : `${filteredArticles.length} result${filteredArticles.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!errorMessage && !isLoading && filteredArticles.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No articles match your search. Try a broader keyword.
          </p>
        ) : null}

        {!errorMessage && !isLoading && filteredArticles.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/user/help-center/${article.slug}`}
                className="rounded-xl border border-gray-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
              >
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{article.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{article.description}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
