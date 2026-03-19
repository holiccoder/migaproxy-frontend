"use client";

import { BellIcon, BoxIconLine, GroupIcon, TaskIcon } from "@/icons";
import React, { useCallback, useEffect, useState } from "react";

type DashboardMetricsResponse = {
  data?: {
    active_subscriptions?: number;
    paid_orders?: number;
    open_tickets?: number;
    unread_notifications?: number;
  };
};

export const EcommerceMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [paidOrders, setPaidOrders] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);


  const getAuthToken = useCallback((): string | null => {
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
  }, []);

  useEffect(() => {
    const fetchMetrics = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch("/api/v1/dashboard/metrics", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as DashboardMetricsResponse;
        setActiveSubscriptions(payload.data?.active_subscriptions ?? 0);
        setPaidOrders(payload.data?.paid_orders ?? 0);
        setOpenTickets(payload.data?.open_tickets ?? 0);
        setUnreadNotifications(payload.data?.unread_notifications ?? 0);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMetrics();
  }, [getAuthToken]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {isLoading ? "-" : activeSubscriptions.toLocaleString()}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Paid Orders</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {isLoading ? "-" : paidOrders.toLocaleString()}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <TaskIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Open Tickets</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {isLoading ? "-" : openTickets.toLocaleString()}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BellIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Unread Notifications</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {isLoading ? "-" : unreadNotifications.toLocaleString()}
          </h4>
        </div>
      </div>
    </div>
  );
};
