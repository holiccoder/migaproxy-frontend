"use client";

import React, { useEffect, useState } from "react";

type UserProfileResponse = Record<string, unknown>;

const AVAILABLE_TRAFFIC_FIELDS = [
  "available_traffic",
  "availableTraffic",
  "traffic_available",
  "trafficAvailable",
  "remaining_traffic",
  "remainingTraffic",
  "traffic_left",
  "trafficLeft",
  "left_traffic",
  "leftTraffic",
] as const;

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

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
};

const getAvailableTrafficValue = (record: Record<string, unknown> | null): unknown => {
  if (!record) {
    return undefined;
  }

  for (const field of AVAILABLE_TRAFFIC_FIELDS) {
    const fieldValue = record[field];

    if (fieldValue !== undefined && fieldValue !== null) {
      return fieldValue;
    }
  }

  return undefined;
};

const formatAvailableTraffic = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^[+-]?\d+(\.\d+)?$/.test(trimmedValue)) {
    const parsedValue = Number(trimmedValue);

    if (Number.isFinite(parsedValue)) {
      return `${parsedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`;
    }
  }

  return trimmedValue;
};

const getAvailableTrafficFromUserPayload = (
  payload: UserProfileResponse | null,
): string | null => {
  if (!payload) {
    return null;
  }

  const payloadRecord = toRecord(payload);
  const payloadData = toRecord(payloadRecord?.data);
  const payloadUser = toRecord(payloadData?.user);

  const availableTrafficValue =
    getAvailableTrafficValue(payloadRecord) ??
    getAvailableTrafficValue(payloadData) ??
    getAvailableTrafficValue(payloadUser);

  return formatAvailableTraffic(availableTrafficValue);
};

export default function AvailableTrafficCard() {
  const [availableTraffic, setAvailableTraffic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableTraffic = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json().catch(() => null)) as UserProfileResponse | null;
        const nextAvailableTraffic = getAvailableTrafficFromUserPayload(payload);

        if (nextAvailableTraffic) {
          setAvailableTraffic(nextAvailableTraffic);
        }
      } catch {
        return;
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAvailableTraffic();
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
      <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Available Traffic</p>
      {isLoading ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {availableTraffic ?? "0 GB"}
        </p>
      )}
    </div>
  );
}
