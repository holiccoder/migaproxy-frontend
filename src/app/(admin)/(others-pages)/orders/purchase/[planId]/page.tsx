"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

const extractCheckoutUrl = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const payloadRecord = payload as Record<string, unknown>;
  const payloadData =
    payloadRecord.data && typeof payloadRecord.data === "object"
      ? (payloadRecord.data as Record<string, unknown>)
      : null;

  return pickString(
    payloadRecord.checkout_url,
    payloadRecord.payment_url,
    payloadRecord.redirect_url,
    payloadRecord.url,
    payloadData?.checkout_url,
    payloadData?.payment_url,
    payloadData?.redirect_url,
    payloadData?.url,
  );
};

export default function PlaceOrderPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();
  const hasStartedRef = useRef(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://sass-starter.test";
  }, []);

  const planId = useMemo(() => {
    const rawPlanId = params?.planId;

    if (Array.isArray(rawPlanId)) {
      return rawPlanId[0] ?? "";
    }

    return rawPlanId ?? "";
  }, [params]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const placeOrder = async (): Promise<void> => {
      const normalizedPlanId = planId.trim();

      if (!normalizedPlanId) {
        setErrorMessage("Invalid plan ID.");
        setIsPlacingOrder(false);
        return;
      }

      const token = getAuthToken();

      if (!token) {
        const redirectPath = `/orders/purchase/${encodeURIComponent(normalizedPlanId)}`;
        const loginParams = new URLSearchParams({ redirect: redirectPath });
        router.replace(`/login?${loginParams.toString()}`);
        return;
      }

      try {
        setErrorMessage(null);
        setIsPlacingOrder(true);
        const planIdentifier: number | string = /^\d+$/.test(normalizedPlanId)
          ? Number(normalizedPlanId)
          : normalizedPlanId;

        const response = await fetch(`${apiBaseUrl}/api/v1/orders`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: planIdentifier,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | Record<string, unknown>
          | null;

        if (!response.ok) {
          setErrorMessage(
            pickString(payload?.message) || "Unable to place order.",
          );
          setIsPlacingOrder(false);
          return;
        }

        const checkoutUrl = extractCheckoutUrl(payload);

        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }

        router.replace("/orders");
      } catch {
        setErrorMessage("Unable to place order.");
        setIsPlacingOrder(false);
      }
    };

    void placeOrder();
  }, [apiBaseUrl, planId, router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Purchase" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {isPlacingOrder ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Creating order for plan #{planId}...
          </p>
        ) : null}

        {!isPlacingOrder && errorMessage ? (
          <div className="space-y-4">
            <p className="text-sm text-error-500">{errorMessage}</p>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Back to Pricing
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
