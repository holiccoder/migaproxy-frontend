"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PricingPlanCard from "@/components/common/PricingPlanCard";
import { ENV } from "@/config/env";
import React, { useEffect, useState } from "react";

type Plan = {
  id?: number | string | null;
  name?: unknown;
  title?: unknown;
  description?: unknown;
  summary?: unknown;
  features?: unknown;
  benefits?: unknown;
  attributes?: Record<string, unknown>;
};

type PlanFeature = {
  key: string;
  value: string;
};

type PlanCardData = {
  id: number | string;
  name: string;
  description: string;
  features: PlanFeature[];
  purchaseHref: string | null;
};

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
    if (typeof value === "string") {
      const trimmedValue = value.trim();

      if (trimmedValue.length > 0) {
        return trimmedValue;
      }
    }
  }

  return "";
};

const normalizePlanId = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return null;
};

const stringifyFeatureValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyFeatureValue(item))
      .filter((item) => item.length > 0)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const valueRecord = value as Record<string, unknown>;

    return pickString(
      valueRecord.value,
      valueRecord.name,
      valueRecord.title,
      valueRecord.label,
      valueRecord.description,
      valueRecord.text,
      valueRecord.content,
    );
  }

  return "";
};

const toFeaturePair = (
  featureKey: unknown,
  featureValue: unknown,
): PlanFeature | null => {
  const normalizedKey = pickString(featureKey);
  const normalizedValue = stringifyFeatureValue(featureValue);

  if (!normalizedKey || !normalizedValue) {
    return null;
  }

  return {
    key: normalizedKey,
    value: normalizedValue,
  };
};

const parseFeatureText = (text: string): PlanFeature | null => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return null;
  }

  const separators = [":", "：", "=", "|"];

  for (const separator of separators) {
    if (!trimmedText.includes(separator)) {
      continue;
    }

    const [leftSide, ...rightParts] = trimmedText.split(separator);
    const featureKey = leftSide?.trim() ?? "";
    const featureValue = rightParts.join(separator).trim();

    if (featureKey && featureValue) {
      return {
        key: featureKey,
        value: featureValue,
      };
    }
  }

  return null;
};

const normalizeFeatures = (features: unknown): PlanFeature[] => {
  if (Array.isArray(features)) {
    return features.flatMap((feature) => normalizeFeatures(feature));
  }

  if (typeof features === "string") {
    const trimmedFeatures = features.trim();

    if (!trimmedFeatures) {
      return [];
    }

    try {
      const parsedFeatures = JSON.parse(trimmedFeatures) as unknown;
      const parsedFeatureList = normalizeFeatures(parsedFeatures);

      if (parsedFeatureList.length > 0) {
        return parsedFeatureList;
      }
    } catch {}

    return trimmedFeatures
      .split(/[\n,]/)
      .map((feature) => parseFeatureText(feature))
      .filter((feature): feature is PlanFeature => feature !== null);
  }

  if (features && typeof features === "object") {
    const featureRecord = features as Record<string, unknown>;

    const nestedFeatureCandidates = [
      featureRecord.features,
      featureRecord.items,
      featureRecord.data,
      featureRecord.list,
    ];

    for (const candidate of nestedFeatureCandidates) {
      const normalizedCandidate = normalizeFeatures(candidate);

      if (normalizedCandidate.length > 0) {
        return normalizedCandidate;
      }
    }

    const primaryPair = toFeaturePair(
      featureRecord.key ??
        featureRecord.name ??
        featureRecord.title ??
        featureRecord.label,
      featureRecord.value ??
        featureRecord.description ??
        featureRecord.text ??
        featureRecord.content,
    );

    if (primaryPair) {
      return [primaryPair];
    }

    return Object.entries(featureRecord)
      .map(([featureKey, featureValue]) =>
        toFeaturePair(featureKey, featureValue),
      )
      .filter((feature): feature is PlanFeature => feature !== null);
  }

  return [];
};

const asPlanArray = (value: unknown): Plan[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((plan): plan is Plan => {
    return Boolean(plan && typeof plan === "object");
  });
};

const extractPlans = (payload: unknown): Plan[] => {
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

    const nestedCandidates = [
      dataRecord.plans,
      dataRecord.items,
      dataRecord.results,
      dataRecord.data,
    ];

    for (const candidate of nestedCandidates) {
      const candidatePlans = asPlanArray(candidate);

      if (candidatePlans.length > 0) {
        return candidatePlans;
      }
    }
  }

  return [];
};

export default function PricingPage() {
  const [plans, setPlans] = useState<PlanCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = ENV.API_BASE_URL;

  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const token = getAuthToken();

        const response = await fetch(`${apiBaseUrl}/api/v1/plans`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          setErrorMessage("Unable to load plans.");
          return;
        }

        const payload = (await response.json()) as unknown;
        const rawPlans = extractPlans(payload);
        const nextPlans: PlanCardData[] = rawPlans.map((plan, index) => {
          const attributes =
            plan.attributes && typeof plan.attributes === "object"
              ? (plan.attributes as Record<string, unknown>)
              : undefined;
          const planId =
            normalizePlanId(plan.id) ?? normalizePlanId(attributes?.id);

          const rawName = pickString(
            plan.name,
            plan.title,
            attributes?.name,
            attributes?.title,
          );
          const rawDescription = pickString(
            plan.description,
            plan.summary,
            attributes?.description,
            attributes?.summary,
          );

          const featuresSource =
            plan.features ??
            plan.benefits ??
            attributes?.features ??
            attributes?.benefits;

          return {
            id: planId ?? `plan-${index}`,
            name: rawName || "未命名套餐",
            description: rawDescription || "暂无套餐描述。",
            features: normalizeFeatures(featuresSource),
            purchaseHref: planId
              ? `/user/orders/purchase/${encodeURIComponent(planId)}`
              : null,
          };
        });

        setPlans(nextPlans);
      } catch {
        setErrorMessage("Unable to load plans.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlans();
  }, [apiBaseUrl]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Pricing" />

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          Loading plans...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-error-500 dark:border-gray-800 dark:bg-white/[0.03]">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && plans.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          No plans available.
        </div>
      ) : null}

      {!isLoading && !errorMessage && plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingPlanCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              features={plan.features}
              purchaseHref={plan.purchaseHref}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
