"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";

type OrderStatus = "pending" | "paid" | "failed";

type OrderItem = {
  id: number;
  status: OrderStatus;
  subtotal: number;
  paid_at: string | null;
  created_at: string;
  plan?: {
    id: number;
    name: string;
  } | null;
};

type OrdersResponse = {
  data?: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");


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

  const formatDate = (dateValue: string | null): string => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  const formatMoney = (value: number): string => {
    return `$${(value / 100).toFixed(2)}`;
  };

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const searchParams = new URLSearchParams();

        if (statusFilter !== "all") {
          searchParams.set("status", statusFilter);
        }

        const response = await fetch(
          `/api/v1/orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setErrorMessage("Unable to load orders.");
          return;
        }

        const payload = (await response.json()) as OrdersResponse;
        setOrders(payload.data ?? []);
      } catch {
        setErrorMessage("Unable to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrders();
  }, [statusFilter]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Orders
          </h3>

          <div className="flex items-center gap-2">
            <label
              htmlFor="order-status-filter"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Filter by status
            </label>
            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "all" | OrderStatus);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            Loading orders...
          </p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-6 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && orders.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">
            No orders found.
          </p>
        ) : null}

        {!isLoading && !errorMessage && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Plan Name
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Creation Date
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Subtotal
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Status
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Paid At
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
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
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {order.status}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                      {formatDate(order.paid_at)}
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
