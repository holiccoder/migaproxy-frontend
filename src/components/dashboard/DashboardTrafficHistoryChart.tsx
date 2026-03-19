"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type TrafficHistoryItem = {
  length?: string | number | null;
  request_date?: string | null;
  total_requests?: string | number | null;
};

type TrafficHistoryResponse = {
  status?: number;
  success?: boolean;
  message?: string;
  data?:
    | TrafficHistoryItem[]
    | {
        data?: TrafficHistoryItem[];
      };
};

type UserProfileResponse = {
  id?: number | string;
  data?: {
    id?: number | string;
  };
};

type TrafficHistoryPoint = {
  timestamp: number;
  label: string;
  traffic: number;
  requests: number;
};

const toNumber = (value: string | number | null | undefined): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const toTimestamp = (value: string): number => {
  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const timestamp = new Date(normalizedValue).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDateLabel = (value: string): string => {
  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
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

const getTrafficHistoryItems = (payload: TrafficHistoryResponse | null): TrafficHistoryItem[] => {
  const responseData = payload?.data;

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  return [];
};

const isNoTrafficHistoryResponse = (payload: TrafficHistoryResponse | null): boolean => {
  const normalizedMessage = payload?.message?.trim().toLowerCase() ?? "";

  if (!normalizedMessage) {
    return false;
  }

  return normalizedMessage.includes("ipmart account not found")
    || normalizedMessage.includes("no traffic history")
    || normalizedMessage.includes("traffic history not found");
};

const parseJsonRecord = (rawValue: string | null): Record<string, unknown> | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    return parsedValue as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getUserIdFromRecord = (record: Record<string, unknown> | null): string | null => {
  if (!record) {
    return null;
  }

  const rawUserId = record.id;

  if (typeof rawUserId === "number" && Number.isFinite(rawUserId)) {
    return String(rawUserId);
  }

  if (typeof rawUserId === "string") {
    const normalizedUserId = rawUserId.trim();
    return normalizedUserId.length > 0 ? normalizedUserId : null;
  }

  return null;
};

const getStoredUserId = (): string | null => {
  const localStorageUserId = getUserIdFromRecord(
    parseJsonRecord(localStorage.getItem("auth_user")),
  );

  if (localStorageUserId) {
    return localStorageUserId;
  }

  const sessionStorageUserId = getUserIdFromRecord(
    parseJsonRecord(sessionStorage.getItem("auth_user")),
  );

  if (sessionStorageUserId) {
    return sessionStorageUserId;
  }

  const loginResponseRecord = parseJsonRecord(localStorage.getItem("auth_login_response"));

  if (!loginResponseRecord) {
    return null;
  }

  const payloadData = loginResponseRecord.data;

  if (!payloadData || typeof payloadData !== "object") {
    return null;
  }

  const payloadUser = (payloadData as Record<string, unknown>).user;

  if (!payloadUser || typeof payloadUser !== "object") {
    return null;
  }

  return getUserIdFromRecord(payloadUser as Record<string, unknown>);
};

export default function DashboardTrafficHistoryChart() {
  const [historyPoints, setHistoryPoints] = useState<TrafficHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    const fetchTrafficHistory = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setErrorMessage("You are not authenticated.");
        setHistoryPoints([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const headers: HeadersInit = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        let userId = getStoredUserId();

        if (!userId) {
          const profileResponse = await fetch("/api/user", {
            method: "GET",
            headers,
          });

          if (profileResponse.ok) {
            const profilePayload =
              (await profileResponse.json().catch(() => null)) as UserProfileResponse | null;

            if (profilePayload) {
              const rawUserId = profilePayload.id ?? profilePayload.data?.id;

              if (typeof rawUserId === "number" || typeof rawUserId === "string") {
                userId = String(rawUserId);
              }
            }
          }
        }

        if (!userId) {
          setErrorMessage("Unable to determine user ID.");
          setHistoryPoints([]);
          return;
        }

        const response = await fetch(
          `/api/v1/ipmart/traffic-history/${encodeURIComponent(userId)}`,
          {
            method: "GET",
            headers,
          },
        );

        const payload = (await response.json().catch(() => null)) as TrafficHistoryResponse | null;

        if (!response.ok) {
          if (isNoTrafficHistoryResponse(payload)) {
            setErrorMessage(null);
            setHistoryPoints([]);
            return;
          }

          setErrorMessage("Unable to load traffic history.");
          setHistoryPoints([]);
          return;
        }

        const nextPoints = getTrafficHistoryItems(payload)
          .map((item) => {
            const requestDate = item.request_date?.trim() ?? "";
            const timestamp = toTimestamp(requestDate);

            return {
              timestamp,
              label: formatDateLabel(requestDate),
              traffic: toNumber(item.length),
              requests: toNumber(item.total_requests),
            };
          })
          .filter((point) => point.timestamp > 0)
          .sort((pointA, pointB) => pointA.timestamp - pointB.timestamp);

        setHistoryPoints(nextPoints);
      } catch {
        setErrorMessage("Unable to load traffic history.");
        setHistoryPoints([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrafficHistory();
  }, []);

  const series = useMemo(
    () => [
      {
        name: "Traffic",
        data: historyPoints.map((point) => point.traffic),
      },
      {
        name: "Requests",
        data: historyPoints.map((point) => point.requests),
      },
    ],
    [historyPoints],
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        type: "line",
        height: 320,
        toolbar: {
          show: false,
        },
      },
      colors: ["#0EA5E9", "#10B981"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
      },
      stroke: {
        curve: "smooth",
        width: [3, 3],
      },
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      markers: {
        size: 3,
        strokeWidth: 0,
        hover: {
          sizeOffset: 2,
        },
      },
      xaxis: {
        type: "category",
        categories: historyPoints.map((point) => point.label),
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
        },
      },
      yaxis: [
        {
          title: {
            text: "Traffic",
            style: {
              color: "#6B7280",
              fontWeight: 500,
            },
          },
          labels: {
            style: {
              colors: ["#6B7280"],
            },
            formatter: (value) => value.toFixed(2),
          },
        },
        {
          opposite: true,
          title: {
            text: "Requests",
            style: {
              color: "#6B7280",
              fontWeight: 500,
            },
          },
          labels: {
            style: {
              colors: ["#6B7280"],
            },
            formatter: (value) => Math.round(value).toLocaleString(),
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: [
          {
            formatter: (value) => value.toFixed(2),
          },
          {
            formatter: (value) => Math.round(value).toLocaleString(),
          },
        ],
      },
    }),
    [historyPoints],
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Traffic History</h3>
      </div>

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading traffic history...</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && historyPoints.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No traffic history found.</p>
        ) : null}

        {!isLoading && !errorMessage && historyPoints.length > 0 ? (
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[720px]">
              <ReactApexChart options={chartOptions} series={series} type="line" height={320} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
