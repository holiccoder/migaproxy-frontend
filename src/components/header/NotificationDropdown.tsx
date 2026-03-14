"use client";
import { ENV } from "@/config/env";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

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
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read_at).length;
  }, [notifications]);

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

  const fetchNotifications = useCallback(async (): Promise<void> => {
    const token = getAuthToken();

    if (!token) {
      setNotifications([]);
      setErrorMessage(null);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const apiBaseUrl = ENV.API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/v1/notifications`, {
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
      setNotifications(payload.data ?? []);
    } catch {
      setErrorMessage("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  function toggleDropdown(): void {
    setIsOpen((previousValue) => !previousValue);
  }

  function closeDropdown(): void {
    setIsOpen(false);
  }

  const handleClick = (): void => {
    toggleDropdown();
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
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

    try {
      const apiBaseUrl = ENV.API_BASE_URL;
      await fetch(`${apiBaseUrl}/api/v1/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
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
    if (isOpen) {
      void fetchNotifications();
    }
  }, [fetchNotifications, isOpen]);

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <li className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              Loading notifications...
            </li>
          ) : null}

          {!isLoading && errorMessage ? (
            <li className="px-4 py-6 text-sm text-error-500">{errorMessage}</li>
          ) : null}

          {!isLoading && !errorMessage && notifications.length === 0 ? (
            <li className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              No notifications yet.
            </li>
          ) : null}

          {!isLoading && !errorMessage
            ? notifications.map((notification) => (
                <li key={notification.id}>
                  <DropdownItem
                    onClick={() => {
                      void markAsRead(notification.id);
                    }}
                    onItemClick={closeDropdown}
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                      !notification.read_at
                        ? "bg-orange-50/40 dark:bg-orange-500/5"
                        : ""
                    }`}
                  >
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                      <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248Z"
                        />
                      </svg>
                      {!notification.read_at ? (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-orange-400 dark:border-gray-900"></span>
                      ) : null}
                    </span>

                    <span className="block">
                      <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {notification.data.admin_name ?? "Admin"}
                        </span>{" "}
                        <span>{notification.data.subject ?? "Notification"}</span>
                      </span>

                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                        {notification.data.message ?? "You have a new notification."}
                      </span>

                      <span className="mt-1.5 flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                        <span>{notification.read_at ? "Read" : "Unread"}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                        <span>{formatNotificationDate(notification)}</span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              ))
            : null}
        </ul>
        {notifications.length > 4 ? (
          <Link
            href="/user/notifications"
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            View All Notifications
          </Link>
        ) : null}
      </Dropdown>
    </div>
  );
}
