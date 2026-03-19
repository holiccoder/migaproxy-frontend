"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type OrderStatus = "pending" | "paid" | "failed";

type DashboardOrder = {
  id: number;
  status: OrderStatus | string;
  subtotal: number;
  paid_at: string | null;
  created_at: string;
  plan?: {
    id: number;
    name: string;
  } | null;
};

type OrdersResponse = {
  data?: DashboardOrder[];
};

type BalanceHistoryItem = {
  id: number;
  type: string;
  amount: number;
  before_balance: number;
  after_balance: number;
  reference: string | null;
  description: string | null;
  created_at: string;
};

type BalanceHistoryResponse = {
  data?: BalanceHistoryItem[];
};

const formatDate = (dateValue: string | null): string => {
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

const formatMoney = (value: number): string => {
  return `$${(value / 100).toFixed(2)}`;
};

const toTimestamp = (value: string): number => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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

const getStatusBadgeClass = (status: string): string => {
  if (status === "paid") {
    return "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300";
  }

  if (status === "pending") {
    return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
  }

  if (status === "failed") {
    return "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-300";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
};

const normalizeLabel = (value: string): string => {
  return value.replace(/_/g, " ");
};

export default function DashboardLatestActivity() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [histories, setHistories] = useState<BalanceHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingHistories, setIsLoadingHistories] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [historiesError, setHistoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardActivity = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setOrdersError("You are not authenticated.");
        setHistoriesError("You are not authenticated.");
        setOrders([]);
        setHistories([]);
        setIsLoadingOrders(false);
        setIsLoadingHistories(false);
        return;
      }

      setOrdersError(null);
      setHistoriesError(null);
      setIsLoadingOrders(true);
      setIsLoadingHistories(true);

      const headers: HeadersInit = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        const [ordersResponse, historiesResponse] = await Promise.all([
          fetch("/api/v1/orders?page=1&per_page=10", {
            method: "GET",
            headers,
          }),
          fetch("/api/v1/wallet/history?page=1&per_page=10", {
            method: "GET",
            headers,
          }),
        ]);

        if (!ordersResponse.ok) {
          setOrdersError("Unable to load latest orders.");
          setOrders([]);
        } else {
          const payload = (await ordersResponse.json().catch(() => null)) as OrdersResponse | null;
          const latestOrders = [...(payload?.data ?? [])]
            .sort((orderA, orderB) => toTimestamp(orderB.created_at) - toTimestamp(orderA.created_at))
            .slice(0, 10);
          setOrders(latestOrders);
        }

        if (!historiesResponse.ok) {
          setHistoriesError("Unable to load balance history.");
          setHistories([]);
        } else {
          const payload = (await historiesResponse.json().catch(() => null)) as BalanceHistoryResponse | null;
          const latestHistories = [...(payload?.data ?? [])]
            .sort((historyA, historyB) => toTimestamp(historyB.created_at) - toTimestamp(historyA.created_at))
            .slice(0, 10);
          setHistories(latestHistories);
        }
      } catch {
        setOrdersError("Unable to load latest orders.");
        setHistoriesError("Unable to load balance history.");
        setOrders([]);
        setHistories([]);
      } finally {
        setIsLoadingOrders(false);
        setIsLoadingHistories(false);
      }
    };

    void fetchDashboardActivity();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Latest Orders</h3>
          <Link
            href="/user/orders"
            className="text-xs font-medium uppercase tracking-wide text-brand-500 hover:text-brand-600"
          >
            View all
          </Link>
        </div>

        {isLoadingOrders ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading orders...</p>
        ) : null}

        {!isLoadingOrders && ordersError ? (
          <p className="py-6 text-sm text-error-500">{ordersError}</p>
        ) : null}

        {!isLoadingOrders && !ordersError && orders.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No orders found.</p>
        ) : null}

        {!isLoadingOrders && !ordersError && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    ID
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Plan
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Date
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Subtotal
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                      #{order.id}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                      {order.plan?.name ?? "-"}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatMoney(order.subtotal)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusBadgeClass(
                          order.status,
                        )}`}
                      >
                        {normalizeLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Latest Balance History</h3>
          <Link
            href="/user/wallet"
            className="text-xs font-medium uppercase tracking-wide text-brand-500 hover:text-brand-600"
          >
            View all
          </Link>
        </div>

        {isLoadingHistories ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading balance history...</p>
        ) : null}

        {!isLoadingHistories && historiesError ? (
          <p className="py-6 text-sm text-error-500">{historiesError}</p>
        ) : null}

        {!isLoadingHistories && !historiesError && histories.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No balance history found.</p>
        ) : null}

        {!isLoadingHistories && !historiesError && histories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Date
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Type
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Before
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    After
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {histories.map((history) => (
                  <tr key={history.id}>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatDate(history.created_at)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {normalizeLabel(history.type)}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm font-medium dark:border-gray-800">
                      <span className={history.amount >= 0 ? "text-success-600" : "text-error-600"}>
                        {history.amount >= 0 ? "+" : "-"}
                        {formatMoney(Math.abs(history.amount))}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatMoney(history.before_balance)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatMoney(history.after_balance)}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {history.reference ?? history.description ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
