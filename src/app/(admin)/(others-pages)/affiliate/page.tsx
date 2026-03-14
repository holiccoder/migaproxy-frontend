"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import React, { useEffect, useMemo, useState } from "react";

type AffiliateDashboardResponse = {
  data?: {
    affiliate?: {
      id: number;
      code: string;
      name?: string | null;
    };
    stats?: {
      clicks_count?: number;
      conversions_count?: number;
      conversion_rate?: number;
      pending_commission?: number;
      available_to_withdraw?: number;
      minimum_threshold?: number;
    };
    traffic_sources?: Array<{
      source: string;
      clicks_count: number;
    }>;
    payout_history?: Array<{
      id: number;
      date: string | null;
      plan_name: string | null;
      commission_amount: number;
      status: string;
    }>;
  };
  message?: string;
};

type AffiliateConversion = {
  id: number;
  status: string;
  commission_amount: number;
  created_at: string;
  approved_at?: string | null;
  paid_at?: string | null;
  user?: {
    email?: string | null;
  } | null;
  order?: {
    plan?: {
      name?: string | null;
    } | null;
  } | null;
};

type AffiliateConversionsResponse = {
  data?: AffiliateConversion[];
  meta?: {
    current_page: number;
    last_page: number;
  };
};

const money = (value: number): string => {
  return `$${(value / 100).toFixed(2)}`;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
};

const statusBadgeClass: Record<string, string> = {
  approved: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300",
  pending: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  paid: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  rejected: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-300",
};

const obfuscateEmail = (email: string | null | undefined): string => {
  if (!email || !email.includes("@")) {
    return "user_@example.com";
  }

  const [localPart, domain] = email.split("@");
  const prefix = localPart.slice(0, 1) || "u";

  return `${prefix}***@${domain}`;
};

export default function AffiliatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [affiliateCode, setAffiliateCode] = useState("");
  const [clicksCount, setClicksCount] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);
  const [availableToWithdraw, setAvailableToWithdraw] = useState(0);
  const [minimumThreshold, setMinimumThreshold] = useState(5000);
  const [trafficSources, setTrafficSources] = useState<Array<{ source: string; clicks_count: number }>>([]);
  const [payoutHistory, setPayoutHistory] = useState<
    Array<{ id: number; date: string | null; plan_name: string | null; commission_amount: number; status: string }>
  >([]);
  const [recentConversions, setRecentConversions] = useState<AffiliateConversion[]>([]);
  const [conversionPage, setConversionPage] = useState(1);
  const [conversionLastPage, setConversionLastPage] = useState(1);

  const [deepLinkInput, setDeepLinkInput] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [autoTransferEnabled, setAutoTransferEnabled] = useState(false);

  const apiBaseUrl = ENV.API_BASE_URL;

  const appBaseUrl = ENV.APP_BASE_URL;

  const getAuthToken = (): string | null => {
    const localToken = localStorage.getItem("auth_token");

    if (localToken) {
      return localToken;
    }

    const sessionToken = sessionStorage.getItem("auth_token");

    if (sessionToken) {
      return sessionToken;
    }

    const authCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("auth_token="));

    if (!authCookie) {
      return null;
    }

    const [, cookieValue = ""] = authCookie.split("=");
    return decodeURIComponent(cookieValue);
  };

  const baseReferralLink = useMemo((): string => {
    if (!affiliateCode) {
      return "";
    }

    return `${appBaseUrl}/?affiliate_code=${encodeURIComponent(affiliateCode)}`;
  }, [affiliateCode, appBaseUrl]);

  const generatedDeepLink = useMemo((): string => {
    if (!affiliateCode || !deepLinkInput.trim()) {
      return "";
    }

    try {
      const url = new URL(deepLinkInput.trim());
      url.searchParams.set("affiliate_code", affiliateCode);
      return url.toString();
    } catch {
      return "";
    }
  }, [affiliateCode, deepLinkInput]);

  const thresholdProgress = useMemo((): number => {
    if (minimumThreshold <= 0) {
      return 100;
    }

    return Math.min(100, Math.round((availableToWithdraw / minimumThreshold) * 100));
  }, [availableToWithdraw, minimumThreshold]);

  const copyToClipboard = async (value: string, label: string): Promise<void> => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback(`${label} copied.`);
      window.setTimeout(() => {
        setCopyFeedback(null);
      }, 1800);
    } catch {
      setCopyFeedback(`Unable to copy ${label.toLowerCase()}.`);
    }
  };

  useEffect(() => {
    const storedValue = localStorage.getItem("affiliate_auto_transfer_enabled");
    setAutoTransferEnabled(storedValue === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("affiliate_auto_transfer_enabled", autoTransferEnabled ? "1" : "0");
  }, [autoTransferEnabled]);

  useEffect(() => {
    const fetchDashboard = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch(`${apiBaseUrl}/api/v1/affiliate/dashboard`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = (await response.json().catch(() => null)) as AffiliateDashboardResponse | null;

        if (!response.ok) {
          setErrorMessage(payload?.message ?? "Unable to load affiliate dashboard.");
          return;
        }

        const stats = payload?.data?.stats;
        setAffiliateCode(payload?.data?.affiliate?.code ?? "");
        setClicksCount(stats?.clicks_count ?? 0);
        setTotalReferrals(stats?.conversions_count ?? 0);
        setConversionRate(stats?.conversion_rate ?? 0);
        setPendingCommission(stats?.pending_commission ?? 0);
        setAvailableToWithdraw(stats?.available_to_withdraw ?? 0);
        setMinimumThreshold(stats?.minimum_threshold ?? 5000);
        setTrafficSources(payload?.data?.traffic_sources ?? []);
        setPayoutHistory(payload?.data?.payout_history ?? []);
      } catch {
        setErrorMessage("Unable to load affiliate dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboard();
  }, [apiBaseUrl]);

  useEffect(() => {
    const fetchConversions = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/affiliate/conversions?page=${conversionPage}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AffiliateConversionsResponse;
        setRecentConversions(payload.data ?? []);
        setConversionLastPage(payload.meta?.last_page ?? 1);
      } catch {
        // keep page resilient on analytics section failures
      }
    };

    void fetchConversions();
  }, [apiBaseUrl, conversionPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Affiliate" />

      {copyFeedback ? (
        <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-4 py-2 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300">
          {copyFeedback}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          Loading affiliate dashboard...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-error-500 dark:border-gray-800 dark:bg-white/[0.03]">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Referrals</p>
              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{totalReferrals}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{clicksCount} tracked clicks</p>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{conversionRate.toFixed(2)}%</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">traffic quality indicator</p>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending Commissions</p>
              <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-300">{money(pendingCommission)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">currently in holding period</p>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Available to Withdraw</p>
              <p className="mt-2 text-2xl font-bold text-success-600 dark:text-success-300">{money(availableToWithdraw)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ready to transfer to wallet</p>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Referral Toolkit</h3>

              <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
                <p className="text-xs uppercase tracking-wider text-brand-600 dark:text-brand-300">Your Unique Link</p>
                <div className="mt-2 flex flex-col gap-2 md:flex-row">
                  <input
                    readOnly
                    value={baseReferralLink}
                    className="h-10 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm text-gray-700 dark:border-brand-500/30 dark:bg-gray-900 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void copyToClipboard(baseReferralLink, "Link");
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deep Linking Tool
                </label>
                <input
                  type="url"
                  value={deepLinkInput}
                  onChange={(event) => {
                    setDeepLinkInput(event.target.value);
                  }}
                  placeholder="Paste a URL from your SaaS, e.g. https://sass-starter.test/blog"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />

                <div className="mt-3 flex flex-col gap-2 md:flex-row">
                  <input
                    readOnly
                    value={generatedDeepLink}
                    placeholder="Tracked URL will appear here"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void copyToClipboard(generatedDeepLink, "Deep link");
                    }}
                    disabled={!generatedDeepLink}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Media Kit</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Download logos and assets for your campaigns.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <a
                  href="/images/logo/logo.svg"
                  download
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Download Logo (Light)
                </a>
                <a
                  href="/images/logo/logo-dark.svg"
                  download
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Download Logo (Dark)
                </a>
                <a
                  href="/images/logo/logo-icon.svg"
                  download
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Download Icon
                </a>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Payout History</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Affiliate-specific payout records separate from wallet activity.
              </p>

              {payoutHistory.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No payouts yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Date
                        </th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Plan
                        </th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Amount
                        </th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((payout) => (
                        <tr key={payout.id}>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {formatDate(payout.date)}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {payout.plan_name ?? "-"}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-success-600 dark:border-gray-800 dark:text-success-300">
                            {money(payout.commission_amount)}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                statusBadgeClass[payout.status] ??
                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {payout.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Payout & Wallet</h3>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-transfer every 30 days
                </span>
                <input
                  type="checkbox"
                  checked={autoTransferEnabled}
                  onChange={(event) => {
                    setAutoTransferEnabled(event.target.checked);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </label>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Minimum threshold tracker</span>
                  <span>
                    {money(availableToWithdraw)}/{money(minimumThreshold)}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${thresholdProgress}%` }}
                  />
                </div>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-1 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Traffic Sources</h3>
              {trafficSources.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No traffic source data yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Source
                        </th>
                        <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Clicks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficSources.map((source) => (
                        <tr key={source.source}>
                          <td className="border-b border-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {source.source}
                          </td>
                          <td className="border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-800 dark:border-gray-800 dark:text-gray-200">
                            {source.clicks_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Conversions</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        Date
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        User
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        Plan Type
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        Commission
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentConversions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="border-b border-gray-100 px-4 py-5 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
                        >
                          No conversions yet.
                        </td>
                      </tr>
                    ) : (
                      recentConversions.map((conversion) => (
                        <tr key={conversion.id}>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {formatDate(conversion.created_at)}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {obfuscateEmail(conversion.user?.email)}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                            {conversion.order?.plan?.name ?? "-"}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-800 dark:border-gray-800 dark:text-gray-200">
                            {money(conversion.commission_amount)}
                          </td>
                          <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                statusBadgeClass[conversion.status] ??
                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {conversion.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {conversionLastPage > 1 ? (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={conversionPage <= 1}
                    onClick={() => {
                      setConversionPage((previousPage) => Math.max(1, previousPage - 1));
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Page {conversionPage} of {conversionLastPage}
                  </span>
                  <button
                    type="button"
                    disabled={conversionPage >= conversionLastPage}
                    onClick={() => {
                      setConversionPage((previousPage) => Math.min(conversionLastPage, previousPage + 1));
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </article>
          </section>
        </div>
      ) : null}
    </div>
  );
}
