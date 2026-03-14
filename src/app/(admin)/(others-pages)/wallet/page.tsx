"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import React, { useEffect, useState } from "react";

type WalletResponse = {
  data?: {
    balance: number;
    balance_formatted: string;
  };
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
  meta?: {
    current_page: number;
    last_page: number;
  };
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [histories, setHistories] = useState<BalanceHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeMethod, setRechargeMethod] = useState("bank_transfer");
  const [rechargeReference, setRechargeReference] = useState("");
  const [rechargeNotes, setRechargeNotes] = useState("");
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  const apiBaseUrl = ENV.API_BASE_URL;

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

  const formatDate = (dateValue: string): string => {
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
    const fetchWallet = async (): Promise<void> => {
      const token = getAuthToken();

      if (!token) {
        setErrorMessage("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [walletResponse, historyResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/v1/wallet`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${apiBaseUrl}/api/v1/wallet/history?page=${currentPage}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!walletResponse.ok || !historyResponse.ok) {
          setErrorMessage("Unable to load wallet data.");
          return;
        }

        const walletPayload = (await walletResponse.json()) as WalletResponse;
        const historyPayload = (await historyResponse.json()) as BalanceHistoryResponse;

        setBalance(walletPayload.data?.balance ?? 0);
        setHistories(historyPayload.data ?? []);
        setCurrentPage(historyPayload.meta?.current_page ?? 1);
        setLastPage(historyPayload.meta?.last_page ?? 1);
      } catch {
        setErrorMessage("Unable to load wallet data.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchWallet();
  }, [apiBaseUrl, currentPage]);

  const handleRechargeSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setRechargeError(null);
    setRechargeSuccess(null);

    const parsedAmount = Number(rechargeAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setRechargeError("Recharge amount must be greater than 0.");
      return;
    }

    if (!rechargeReference.trim()) {
      setRechargeError("Payment reference is required.");
      return;
    }

    setRechargeSuccess("Recharge request submitted.");
    setTimeout(() => {
      setIsRechargeOpen(false);
      setRechargeAmount("");
      setRechargeMethod("bank_transfer");
      setRechargeReference("");
      setRechargeNotes("");
      setRechargeSuccess(null);
    }, 700);
  };

  const handleWithdrawSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const parsedAmount = Number(withdrawAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setWithdrawError("Withdraw amount must be greater than 0.");
      return;
    }

    if (!withdrawBankName.trim() || !withdrawAccountName.trim() || !withdrawAccountNumber.trim()) {
      setWithdrawError("Bank details are required.");
      return;
    }

    setWithdrawSuccess("Withdrawal request submitted.");
    setTimeout(() => {
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawBankName("");
      setWithdrawAccountName("");
      setWithdrawAccountNumber("");
      setWithdrawNotes("");
      setWithdrawSuccess(null);
    }, 700);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Wallet" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Current Balance</h3>
            <p className="mt-2 text-3xl font-bold text-brand-500">{formatMoney(balance)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRechargeError(null);
                setRechargeSuccess(null);
                setIsRechargeOpen(true);
              }}
              className="inline-flex rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
            >
              Recharge
            </button>
            <button
              type="button"
              onClick={() => {
                setWithdrawError(null);
                setWithdrawSuccess(null);
                setIsWithdrawOpen(true);
              }}
              className="inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Balance History</h3>

        {isLoading ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading balance history...</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-6 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && histories.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No balance history found.</p>
        ) : null}

        {!isLoading && !errorMessage && histories.length > 0 ? (
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
                        {history.type}
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
                      {history.reference ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !errorMessage && lastPage > 1 ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => {
                setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {lastPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= lastPage}
              onClick={() => {
                setCurrentPage((previousPage) => Math.min(lastPage, previousPage + 1));
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {isRechargeOpen ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Recharge Wallet</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Fill in payment details to submit a recharge request.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleRechargeSubmit}>
              {rechargeError ? <p className="text-sm text-error-500">{rechargeError}</p> : null}
              {rechargeSuccess ? (
                <p className="text-sm text-success-600 dark:text-success-400">{rechargeSuccess}</p>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={rechargeAmount}
                  onChange={(event) => setRechargeAmount(event.target.value)}
                  placeholder="100.00"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Payment Method</label>
                <select
                  value={rechargeMethod}
                  onChange={(event) => setRechargeMethod(event.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Payment Reference</label>
                <input
                  type="text"
                  value={rechargeReference}
                  onChange={(event) => setRechargeReference(event.target.value)}
                  placeholder="TRX-123456"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={rechargeNotes}
                  onChange={(event) => setRechargeNotes(event.target.value)}
                  placeholder="Additional payment note..."
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRechargeOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
                >
                  Submit Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isWithdrawOpen ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Withdraw Funds</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Fill in withdrawal details to submit your request.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleWithdrawSubmit}>
              {withdrawError ? <p className="text-sm text-error-500">{withdrawError}</p> : null}
              {withdrawSuccess ? (
                <p className="text-sm text-success-600 dark:text-success-400">{withdrawSuccess}</p>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  placeholder="50.00"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Bank Name</label>
                <input
                  type="text"
                  value={withdrawBankName}
                  onChange={(event) => setWithdrawBankName(event.target.value)}
                  placeholder="Example Bank"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Account Name</label>
                <input
                  type="text"
                  value={withdrawAccountName}
                  onChange={(event) => setWithdrawAccountName(event.target.value)}
                  placeholder="John Doe"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Account Number</label>
                <input
                  type="text"
                  value={withdrawAccountNumber}
                  onChange={(event) => setWithdrawAccountNumber(event.target.value)}
                  placeholder="0123456789"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={withdrawNotes}
                  onChange={(event) => setWithdrawNotes(event.target.value)}
                  placeholder="Additional payout note..."
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Submit Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
