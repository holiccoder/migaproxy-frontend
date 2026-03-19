"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { toRelativeApiUrl } from "@/config/env";
import React, { useCallback, useEffect, useState } from "react";

type NotificationData = {
  subject?: string;
  message?: string;
  admin_name?: string;
  sent_at?: string;
};

type ApiNotification = {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
};

type NotificationsResponse = {
  data?: ApiNotification[];
  next_page_url?: string | null;
};

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<ApiNotification | null>(null);

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

  const fetchAllNotifications = useCallback(async (): Promise<void> => {
    const token = getAuthToken();

    if (!token) {
      setNotifications([]);
      setErrorMessage("Please login to view notifications.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      let pageUrl: string | null = "/api/v1/notifications";
      const allNotifications: ApiNotification[] = [];

      while (pageUrl) {
        const response = await fetch(pageUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setErrorMessage("Unable to load notifications.");
          return;
        }

        const payload = (await response.json()) as NotificationsResponse;
        allNotifications.push(...(payload.data ?? []));
        pageUrl = payload.next_page_url ? toRelativeApiUrl(payload.next_page_url) : null;
      }

      setNotifications(allNotifications);
    } catch {
      setErrorMessage("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        return;
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: notification.read_at ?? new Date().toISOString() }
            : notification
        )
      );
      setSelectedNotification((previousNotification) =>
        previousNotification && previousNotification.id === notificationId
          ? { ...previousNotification, read_at: previousNotification.read_at ?? new Date().toISOString() }
          : previousNotification
      );

      try {
        await fetch(`/api/v1/notifications/${notificationId}/read`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    },
    [getAuthToken]
  );

  const handleNotificationClick = (notification: ApiNotification): void => {
    setSelectedNotification(notification);

    if (!notification.read_at) {
      void markAsRead(notification.id);
    }
  };

  const formatNotificationDate = (notification: ApiNotification): string => {
    const rawDate = notification.data.sent_at ?? notification.created_at;
    const notificationDate = new Date(rawDate);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString();
  };

  useEffect(() => {
    void fetchAllNotifications();
  }, [fetchAllNotifications]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          All Notifications
        </h3>

        {isLoading ? (
          <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
            Loading notifications...
          </p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-8 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && notifications.length === 0 ? (
          <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
            No notifications yet.
          </p>
        ) : null}

        {!isLoading && !errorMessage && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => (
              <li key={notification.id} className="py-4">
                <button
                  type="button"
                  onClick={() => {
                    handleNotificationClick(notification);
                  }}
                  className="w-full rounded-lg p-3 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {notification.data.admin_name ?? "Admin"}
                        </span>{" "}
                        {notification.data.subject ?? "Notification"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {notification.data.message ?? "You have a new notification."}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          notification.read_at
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                        }`}
                      >
                        {notification.read_at ? "Read" : "Unread"}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatNotificationDate(notification)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selectedNotification ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {selectedNotification.data.subject ?? "Notification"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              From {selectedNotification.data.admin_name ?? "Admin"} •{" "}
              {formatNotificationDate(selectedNotification)}
            </p>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-200">
              {selectedNotification.data.message ?? "You have a new notification."}
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
