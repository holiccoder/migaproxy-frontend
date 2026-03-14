"use client";

import { ENV } from "@/config/env";
import { DollarLineIcon } from "@/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type WalletResponse = {
  data?: {
    balance?: number;
    balance_formatted?: string;
  };
};

const formatMoney = (value: number): string => {
  return `$${(value / 100).toFixed(2)}`;
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

export default function DashboardWalletBalanceCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [balanceFormatted, setBalanceFormatted] = useState<string | null>(null);

  const apiBaseUrl = ENV.API_BASE_URL;

  useEffect(() => {
    const fetchWalletBalance = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch(`${apiBaseUrl}/api/v1/wallet`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setErrorMessage("Unable to load wallet balance.");
          return;
        }

        const payload = (await response.json().catch(() => null)) as WalletResponse | null;
        const nextBalance = payload?.data?.balance ?? 0;
        const nextFormattedBalance = payload?.data?.balance_formatted?.trim() ?? "";

        setBalance(nextBalance);
        setBalanceFormatted(nextFormattedBalance || null);
      } catch {
        setErrorMessage("Unable to load wallet balance.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchWalletBalance();
  }, [apiBaseUrl]);

  const displayedBalance = balanceFormatted ?? formatMoney(balance);

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <DollarLineIcon className="h-5 w-5" />
        </div>
        <Link
          href="/user/wallet"
          className="text-xs font-medium uppercase tracking-wide text-brand-500 hover:text-brand-600"
        >
          Open wallet
        </Link>
      </div>

      <p className="mt-5 text-xs uppercase text-gray-500 dark:text-gray-400">Wallet Balance</p>

      {isLoading ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading balance...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="mt-2 text-sm text-error-500">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{displayedBalance}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Available for orders, renewals, and other account charges.
          </p>
        </>
      ) : null}
    </div>
  );
}
