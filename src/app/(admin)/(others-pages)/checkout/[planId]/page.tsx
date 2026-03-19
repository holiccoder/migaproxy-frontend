"use client";

import BrandLogo from "@/components/common/BrandLogo";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";

type PlanFeature = {
  key: string;
  value: string;
};

type PlanRecord = {
  id?: number | string | null;
  name?: unknown;
  title?: unknown;
  description?: unknown;
  summary?: unknown;
  traffic?: unknown;
  price?: unknown;
  days?: unknown;
  features?: unknown;
  benefits?: unknown;
  attributes?: Record<string, unknown>;
};

type PlanDetails = {
  id: number | string;
  name: string;
  description: string;
  traffic: number;
  price: number;
  days: number;
  features: PlanFeature[];
};

type CheckoutResponse = {
  message?: string;
  data?: {
    order?: {
      id?: number | string;
      status?: string;
    };
    subscription?: {
      id?: number | string;
      status?: string;
    } | null;
    wallet?: {
      balance?: number;
      balance_formatted?: string;
    };
  };
};

type WalletResponse = {
  balance?: unknown;
  wallet_balance?: unknown;
  data?: {
    balance?: unknown;
    wallet_balance?: unknown;
  };
};

type PaymentMethod = "wallet" | "credit_card" | "paypal" | "alipay" | "wechat_pay";

const SUPPORT_EMAILS = ["support@goproxy.com", "billing@goproxy.com"] as const;

const CUSTOMER_NOTES = [
  "Please review your plan details and coupon code before confirming the order.",
  "Wallet is selected by default. Other methods are listed for your preferred checkout flow.",
  "If you need invoice support or a custom quote, contact customer support before payment.",
] as const;

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "wallet", label: "Wallet (Default)" },
  { value: "credit_card", label: "Credit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "alipay", label: "Alipay" },
  { value: "wechat_pay", label: "WeChat Pay" },
];

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

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > 0) {
      return trimmedValue;
    }
  }

  return "";
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedNumber = Number(value.trim());

    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }
  }

  return null;
};

const toPlanId = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return null;
};

const formatMoney = (value: number): string => {
  return `$${(value / 100).toFixed(2)}`;
};

const toFeaturePair = (featureKey: unknown, featureValue: unknown): PlanFeature | null => {
  const normalizedKey = pickString(featureKey);
  const normalizedValue = pickString(
    featureValue,
    typeof featureValue === "number" || typeof featureValue === "boolean"
      ? String(featureValue)
      : null,
  );

  if (!normalizedKey || !normalizedValue) {
    return null;
  }

  return {
    key: normalizedKey,
    value: normalizedValue,
  };
};

const normalizeFeatures = (features: unknown): PlanFeature[] => {
  if (Array.isArray(features)) {
    return features
      .flatMap((entry) => normalizeFeatures(entry))
      .filter((entry): entry is PlanFeature => Boolean(entry));
  }

  if (typeof features === "string") {
    const trimmedFeatures = features.trim();

    if (!trimmedFeatures) {
      return [];
    }

    return trimmedFeatures
      .split(/\n|,/)
      .map((entry) => {
        const [leftSide, ...rightParts] = entry.split(":");
        const key = leftSide?.trim() ?? "";
        const value = rightParts.join(":").trim();

        if (!key || !value) {
          return null;
        }

        return {
          key,
          value,
        };
      })
      .filter((entry): entry is PlanFeature => entry !== null);
  }

  if (features && typeof features === "object") {
    const featureRecord = features as Record<string, unknown>;

    return Object.entries(featureRecord)
      .map(([featureKey, featureValue]) => toFeaturePair(featureKey, featureValue))
      .filter((entry): entry is PlanFeature => entry !== null);
  }

  return [];
};

const asPlanArray = (value: unknown): PlanRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is PlanRecord => {
    return Boolean(entry && typeof entry === "object");
  });
};

const extractPlans = (payload: unknown): PlanRecord[] => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const payloadRecord = payload as Record<string, unknown>;
  const directCandidates = [
    payloadRecord.data,
    payloadRecord.plans,
    payloadRecord.items,
    payloadRecord.results,
  ];

  for (const candidate of directCandidates) {
    const candidatePlans = asPlanArray(candidate);

    if (candidatePlans.length > 0) {
      return candidatePlans;
    }
  }

  if (payloadRecord.data && typeof payloadRecord.data === "object") {
    const dataRecord = payloadRecord.data as Record<string, unknown>;
    const nestedCandidates = [dataRecord.data, dataRecord.plans, dataRecord.items, dataRecord.results];

    for (const candidate of nestedCandidates) {
      const candidatePlans = asPlanArray(candidate);

      if (candidatePlans.length > 0) {
        return candidatePlans;
      }
    }
  }

  return [];
};

const toPlanDetails = (plan: PlanRecord): PlanDetails | null => {
  const attributes =
    plan.attributes && typeof plan.attributes === "object"
      ? (plan.attributes as Record<string, unknown>)
      : undefined;
  const id = toPlanId(plan.id) ?? toPlanId(attributes?.id);

  if (!id) {
    return null;
  }

  const price = toFiniteNumber(plan.price ?? attributes?.price) ?? 0;
  const traffic = toFiniteNumber(plan.traffic ?? attributes?.traffic) ?? 0;
  const days = toFiniteNumber(plan.days ?? attributes?.days) ?? 30;
  const name = pickString(plan.name, plan.title, attributes?.name, attributes?.title) || "Plan";
  const description =
    pickString(plan.description, plan.summary, attributes?.description, attributes?.summary)
    || "No description available.";
  let features = normalizeFeatures(
    plan.features ?? plan.benefits ?? attributes?.features ?? attributes?.benefits,
  );

  if (!features.some((feature) => feature.key.trim().toLowerCase() === "price")) {
    features = [{ key: "Price", value: formatMoney(price) }, ...features];
  }

  return {
    id,
    name,
    description,
    traffic: Math.round(traffic),
    price: Math.round(price),
    days: Math.max(1, Math.round(days)),
    features,
  };
};

const extractWalletBalance = (payload: WalletResponse | null): number | null => {
  if (!payload) {
    return null;
  }

  const candidates: unknown[] = [
    payload.balance,
    payload.wallet_balance,
    payload.data?.balance,
    payload.data?.wallet_balance,
  ];

  for (const candidate of candidates) {
    const parsedBalance = toFiniteNumber(candidate);

    if (parsedBalance !== null) {
      return Math.round(parsedBalance);
    }
  }

  return null;
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planErrorMessage, setPlanErrorMessage] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [orderComment, setOrderComment] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  const planId = useMemo(() => {
    const rawPlanId = params?.planId;

    if (Array.isArray(rawPlanId)) {
      return rawPlanId[0] ?? "";
    }

    return rawPlanId ?? "";
  }, [params]);

  useEffect(() => {
    const normalizedPlanId = planId.trim();

    if (!normalizedPlanId) {
      return;
    }

    const token = getAuthToken();

    if (token) {
      return;
    }

    const redirectPath = `/user/checkout/${encodeURIComponent(normalizedPlanId)}`;
    const loginParams = new URLSearchParams({ redirect: redirectPath });

    router.replace(`/login?${loginParams.toString()}`);
  }, [planId, router]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    let isMounted = true;

    const fetchWalletBalance = async (): Promise<void> => {
      try {
        const response = await fetch("/api/v1/wallet", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json().catch(() => null)) as WalletResponse | null;
        const nextBalance = extractWalletBalance(payload);

        if (!isMounted || nextBalance === null) {
          return;
        }

        setWalletBalance(nextBalance);
      } catch {
        return;
      }
    };

    void fetchWalletBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const normalizedPlanId = planId.trim();

    if (!normalizedPlanId) {
      setPlanErrorMessage("Invalid plan ID.");
      setPlan(null);
      setIsLoadingPlan(false);
      return;
    }

    const fetchPlan = async (): Promise<void> => {
      try {
        setIsLoadingPlan(true);
        setPlanErrorMessage(null);

        const response = await fetch("/api/v1/plans", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setPlanErrorMessage("Unable to load plan details.");
          setPlan(null);
          return;
        }

        const payload = (await response.json().catch(() => null)) as unknown;
        const mappedPlans = extractPlans(payload)
          .map((entry) => toPlanDetails(entry))
          .filter((entry): entry is PlanDetails => entry !== null);
        const matchedPlan = mappedPlans.find((entry) => String(entry.id) === normalizedPlanId);

        if (!matchedPlan) {
          setPlanErrorMessage("Selected plan was not found.");
          setPlan(null);
          return;
        }

        setPlan(matchedPlan);
      } catch {
        setPlanErrorMessage("Unable to load plan details.");
        setPlan(null);
      } finally {
        setIsLoadingPlan(false);
      }
    };

    void fetchPlan();
  }, [planId]);

  const handleConfirmOrder = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitErrorMessage(null);
    setSubmitSuccessMessage(null);

    if (!plan) {
      setSubmitErrorMessage("Selected plan is not available.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      const redirectPath = `/user/checkout/${encodeURIComponent(String(plan.id))}`;
      const loginParams = new URLSearchParams({ redirect: redirectPath });
      router.replace(`/login?${loginParams.toString()}`);
      return;
    }

    const normalizedPlanId = Number(plan.id);

    if (!Number.isInteger(normalizedPlanId)) {
      setSubmitErrorMessage("Invalid plan ID.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: normalizedPlanId,
          payment_method: paymentMethod,
          ...(couponCode.trim() ? { coupon_code: couponCode.trim() } : {}),
          ...(orderComment.trim() ? { order_comment: orderComment.trim() } : {}),
        }),
      });

      const payload = (await response.json().catch(() => null)) as CheckoutResponse | null;

      if (!response.ok) {
        setSubmitErrorMessage(pickString(payload?.message) || "Unable to confirm order.");
        return;
      }

      setSubmitSuccessMessage(
        pickString(payload?.message) || "Payment successful. Plan ordered and subscription activated.",
      );

      window.setTimeout(() => {
        router.replace("/user/orders");
      }, 700);
    } catch {
      setSubmitErrorMessage("Unable to confirm order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Checkout" />

      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col items-center gap-3">
            <BrandLogo width={180} height={42} className="h-9 w-auto" priority />

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Need help with your order?</p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {SUPPORT_EMAILS.map((email) => (
                  <a key={email} href={`mailto:${email}`} className="hover:text-brand-500">
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Notes to Customer</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {CUSTOMER_NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 xl:order-2 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Checkout Form</h3>

            <form className="mt-5 space-y-5" onSubmit={handleConfirmOrder}>
              <div>
                <label
                  htmlFor="payment-method"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(event.target.value as PaymentMethod);
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value === "wallet"
                        ? `Wallet(${walletBalance !== null ? formatMoney(walletBalance) : "$0.00"})`
                        : option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="coupon-code"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Coupon Code
                </label>
                <input
                  id="coupon-code"
                  type="text"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value);
                  }}
                  placeholder="Enter coupon code (optional)"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label
                  htmlFor="order-comment"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Order Comment
                </label>
                <textarea
                  id="order-comment"
                  rows={4}
                  value={orderComment}
                  onChange={(event) => {
                    setOrderComment(event.target.value);
                  }}
                  placeholder="Add any order note for support (optional)"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              {submitErrorMessage ? <p className="text-sm text-error-500">{submitErrorMessage}</p> : null}
              {submitSuccessMessage ? <p className="text-sm text-success-600 dark:text-success-400">{submitSuccessMessage}</p> : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/user/pricing"
                  className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Back to Pricing
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingPlan || !plan}
                  className="inline-flex rounded-lg bg-success-500 px-5 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 xl:order-1 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Plan Details</h3>

            {isLoadingPlan ? <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading plan details...</p> : null}

            {!isLoadingPlan && planErrorMessage ? <p className="mt-4 text-sm text-error-500">{planErrorMessage}</p> : null}

            {!isLoadingPlan && !planErrorMessage && plan ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                </div>

                <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">Plan ID</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{plan.id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">Traffic</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{plan.traffic} GB</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">Validity</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{plan.days} days</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">{formatMoney(plan.price)}</dd>
                  </div>
                </dl>

                {plan.features.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                    {plan.features.map((feature, index) => (
                      <div
                        key={`${feature.key}-${feature.value}-${index}`}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <span className="text-gray-500 dark:text-gray-400">{feature.key}</span>
                        <span className="text-right font-medium text-gray-900 dark:text-white">{feature.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
