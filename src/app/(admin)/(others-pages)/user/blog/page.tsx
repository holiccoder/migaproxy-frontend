"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { BLOG_POSTS_API_ENDPOINT, toBlogImageUrl } from "@/lib/blog-endpoints";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type BlogPost = {
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  cover_image_path: string | null;
};

type PostsResponse = {
  data?: BlogPost[];
};

export default function BlogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const searchParams = new URLSearchParams();

        if (searchQuery.trim()) {
          searchParams.set("search", searchQuery.trim());
        }

        const response = await fetch(
          `${BLOG_POSTS_API_ENDPOINT}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          setErrorMessage("Unable to load blog posts.");
          return;
        }

        const payload = (await response.json()) as PostsResponse;
        setPosts(payload.data ?? []);
      } catch {
        setErrorMessage("Unable to load blog posts.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
  }, [searchQuery]);

  const formatDate = (publishedAt: string | null): string => {
    if (!publishedAt) {
      return "Unpublished";
    }

    const date = new Date(publishedAt);

    if (Number.isNaN(date.getTime())) {
      return "Unpublished";
    }

    return date.toLocaleDateString();
  };

  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Map<string, string>();

    posts.forEach((post) => {
      post.categories?.forEach((category) => {
        uniqueCategories.set(category.slug, category.name);
      });
    });

    return Array.from(uniqueCategories.entries()).map(([slug, name]) => ({
      slug,
      name,
    }));
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (selectedCategory === "all") {
      return posts;
    }

    return posts.filter((post) =>
      post.categories?.some((category) => category.slug === selectedCategory)
    );
  }, [posts, selectedCategory]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Blog" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-brand-50 via-white to-blue-50 px-5 py-8 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 lg:px-8">
          <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/20" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20" />
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
              Blog Discover
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Insights, updates, and product stories
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Search articles by title and quickly jump into the latest content.
            </p>
            <div className="mt-5">
              <label
                htmlFor="blog-search"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Search by title
              </label>
              <input
                id="blog-search"
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Search blog posts..."
                className="h-12 w-full rounded-full border border-gray-300 bg-white/80 px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 backdrop-blur-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900/80 dark:text-white/90"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            Loading blog posts...
          </p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-6 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && visiblePosts.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            No blog posts found.
          </p>
        ) : null}

        {!isLoading && !errorMessage && posts.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                }}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedCategory === "all"
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
                }`}
              >
                All
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.slug);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    selectedCategory === category.slug
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePosts.map((post) => {
              const coverImageUrl = toBlogImageUrl(post.cover_image_path);
              const categoryTitle = post.categories?.[0]?.name ?? "General";

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex h-full flex-col">
                    <div className="h-48 w-full bg-gray-100 dark:bg-gray-800">
                      {coverImageUrl ? (
                        <Link href={`/user/blog/${post.slug}`} className="block h-full w-full">
                          <img
                            src={coverImageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex h-full flex-1 flex-col p-5">
                      <Link href={`/user/blog/${post.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-800 transition-colors hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                        {post.excerpt ?? "No excerpt available."}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate font-medium">{categoryTitle}</span>
                        <span className="shrink-0">{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
