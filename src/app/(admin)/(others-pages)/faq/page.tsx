"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import React, { useEffect, useState } from "react";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

type FaqResponse = {
  data?: FaqItem[];
};

export default function FaqPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqItems = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const apiBaseUrl = ENV.API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/api/v1/faq`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setErrorMessage("Unable to load FAQ content.");
          setFaqItems([]);
          setOpenId(null);
          return;
        }

        const payload = (await response.json()) as FaqResponse;
        const items = payload.data ?? [];
        setFaqItems(items);
        setOpenId(items[0]?.id ?? null);
      } catch {
        setErrorMessage("Unable to load FAQ content.");
        setFaqItems([]);
        setOpenId(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFaqItems();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="FAQ" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Frequently Asked Questions
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quick answers for common account, billing, and support questions.
          </p>
        </div>

        {isLoading ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            Loading FAQs...
          </p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-6 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && faqItems.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            No FAQ entries available.
          </p>
        ) : null}

        {!isLoading && !errorMessage && faqItems.length > 0 ? (
          <div className="space-y-3">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId((previousId) => (previousId === item.id ? null : item.id));
                    }}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {item.question}
                    </span>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-700 transition-transform dark:border-gray-700 dark:text-gray-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      v
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {item.answer}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
