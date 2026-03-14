"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import Link from "next/link";
import React, { FormEvent, useCallback, useEffect, useState } from "react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "billing" | "technical" | "feature_request";

type TicketMessage = {
  id: number;
  message: string;
  created_at: string;
};

type Ticket = {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  updated_at: string;
  created_at: string;
  messages?: TicketMessage[];
};

type TicketsResponse = {
  data?: Ticket[];
};

type TicketCreateResponse = {
  message?: string;
  data?: {
    id: number;
  };
  errors?: {
    subject?: string[];
    category?: string[];
    priority?: string[];
    message?: string[];
    attachment?: string[];
  };
};

const categoryLabel: Record<TicketCategory, string> = {
  billing: "Billing",
  technical: "Technical",
  feature_request: "Feature Request",
};

const statusBadgeClass: Record<TicketStatus, string> = {
  open: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300",
  in_progress: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  resolved: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const statusLabel: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<"all" | TicketStatus>("all");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<{
    subject?: string;
    category?: string;
    priority?: string;
    message?: string;
    attachment?: string;
  }>({});
  const [createAttachment, setCreateAttachment] = useState<File | null>(null);

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

  const relativeTime = (dateValue: string): string => {
    const date = new Date(dateValue);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return "Updated just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
  };

  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Edg")) {
      return "Edge";
    }
    if (userAgent.includes("Chrome")) {
      return "Chrome";
    }
    if (userAgent.includes("Safari")) {
      return "Safari";
    }
    if (userAgent.includes("Firefox")) {
      return "Firefox";
    }

    return "Unknown";
  };

  const detectOs = (): string => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Windows")) {
      return "Windows";
    }
    if (userAgent.includes("Mac OS")) {
      return "macOS";
    }
    if (userAgent.includes("Linux")) {
      return "Linux";
    }
    if (userAgent.includes("Android")) {
      return "Android";
    }
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "iOS";
    }

    return "Unknown";
  };

  const fetchTickets = useCallback(async (): Promise<void> => {
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

      if (search.trim()) {
        searchParams.set("search", search.trim());
      }
      if (status !== "all") {
        searchParams.set("status", status);
      }
      if (dateFrom) {
        searchParams.set("date_from", dateFrom);
      }
      if (dateTo) {
        searchParams.set("date_to", dateTo);
      }

      const response = await fetch(
        `${apiBaseUrl}/api/v1/tickets${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setErrorMessage("Unable to load tickets.");
        return;
      }

      const payload = (await response.json()) as TicketsResponse;
      setTickets(payload.data ?? []);
    } catch {
      setErrorMessage("Unable to load tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, dateFrom, dateTo, search, status]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const applyFilters = (): void => {
    setSearch(searchInput);
    setStatus(statusInput);
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
  };

  const resetFilters = (): void => {
    setSearchInput("");
    setStatusInput("all");
    setDateFromInput("");
    setDateToInput("");
    setSearch("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleCreateTicket = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setCreateError(null);
    setCreateSuccess(null);
    setCreateFieldErrors({});
    setIsSubmitting(true);

    const token = getAuthToken();

    if (!token) {
      setCreateError("You are not authenticated.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(formElement);
    const subject = String(formData.get("subject") ?? "").trim();
    const category = String(formData.get("category") ?? "technical") as TicketCategory;
    const priority = String(formData.get("priority") ?? "medium");
    const message = String(formData.get("message") ?? "").trim();
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      let requestBody: BodyInit;

      if (createAttachment) {
        const payload = new FormData();
        payload.append("subject", subject);
        payload.append("category", category);
        payload.append("priority", priority);
        payload.append("message", message);
        payload.append("context[browser]", detectBrowser());
        payload.append("context[os]", detectOs());
        payload.append("context[plan_type]", "Unknown");
        payload.append("attachment", createAttachment);
        requestBody = payload;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          subject,
          category,
          priority,
          message,
          context: {
            browser: detectBrowser(),
            os: detectOs(),
            plan_type: "Unknown",
          },
        });
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/tickets`, {
        method: "POST",
        headers,
        body: requestBody,
      });

      const responseText = await response.text();
      let payload: TicketCreateResponse | null = null;

      if (responseText) {
        try {
          payload = JSON.parse(responseText) as TicketCreateResponse;
        } catch {
          payload = null;
        }
      }

      if (!response.ok) {
        setCreateFieldErrors({
          subject: payload?.errors?.subject?.[0],
          category: payload?.errors?.category?.[0],
          priority: payload?.errors?.priority?.[0],
          message: payload?.errors?.message?.[0],
          attachment: payload?.errors?.attachment?.[0],
        });
        setCreateError(payload?.message ?? `Unable to create ticket. (${response.status})`);
        return;
      }

      setCreateSuccess(payload?.message ?? "Ticket created successfully.");
      formElement.reset();
      setCreateAttachment(null);
      setTimeout(() => {
        setIsCreateOpen(false);
      }, 600);
      void fetchTickets();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tickets" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="grid w-full grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label
              htmlFor="ticket-search"
              className="mb-1.5 block text-xs text-gray-600 dark:text-gray-300"
            >
              Search
            </label>
            <input
              id="ticket-search"
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder="Search by ticket ID or subject"
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-status"
              className="mb-1.5 block text-xs text-gray-600 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="ticket-status"
              value={statusInput}
              onChange={(event) => {
                setStatusInput(event.target.value as "all" | TicketStatus);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-date-from"
              className="mb-1.5 block text-xs text-gray-600 dark:text-gray-300"
            >
              Date From
            </label>
            <input
              id="ticket-date-from"
              type="date"
              value={dateFromInput}
              onChange={(event) => {
                setDateFromInput(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-date-to"
              className="mb-1.5 block text-xs text-gray-600 dark:text-gray-300"
            >
              Date To
            </label>
            <input
              id="ticket-date-to"
              type="date"
              value={dateToInput}
              onChange={(event) => {
                setDateToInput(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(true);
                setCreateError(null);
                setCreateSuccess(null);
                setCreateFieldErrors({});
              }}
              className="ml-auto inline-flex rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Create Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {isLoading ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading tickets...</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-6 text-sm text-error-500">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && tickets.length === 0 ? (
          <p className="py-6 text-sm text-gray-500 dark:text-gray-400">No tickets found.</p>
        ) : null}

        {!isLoading && !errorMessage && tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Ticket ID
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Subject
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Category
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Priority
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Last Activity
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const lastActivity = ticket.messages?.[0]?.created_at ?? ticket.updated_at;

                  return (
                    <tr key={ticket.id}>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                        #{ticket.id}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                        <Link
                          href={`/user/tickets/${ticket.id}`}
                          className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                        {categoryLabel[ticket.category] ?? ticket.category}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                        {relativeTime(lastActivity)}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass[ticket.status]}`}
                        >
                          {statusLabel[ticket.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Ticket
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tell us what you need help with.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleCreateTicket}>
              {createError ? <p className="text-sm text-error-500">{createError}</p> : null}
              {createSuccess ? (
                <p className="text-sm text-success-600 dark:text-success-400">
                  {createSuccess}
                </p>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Brief summary of your issue"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
                {createFieldErrors.subject ? (
                  <p className="mt-1 text-xs text-error-500">{createFieldErrors.subject}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="technical"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                >
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="feature_request">Feature Request</option>
                </select>
                {createFieldErrors.category ? (
                  <p className="mt-1 text-xs text-error-500">{createFieldErrors.category}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {createFieldErrors.priority ? (
                  <p className="mt-1 text-xs text-error-500">{createFieldErrors.priority}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Describe the problem and expected outcome..."
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                />
                {createFieldErrors.message ? (
                  <p className="mt-1 text-xs text-error-500">{createFieldErrors.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">
                  Attachment (optional)
                </label>
                <input
                  type="file"
                  onChange={(event) => {
                    setCreateAttachment(event.target.files?.[0] ?? null);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 dark:text-gray-400"
                />
                {createFieldErrors.attachment ? (
                  <p className="mt-1 text-xs text-error-500">{createFieldErrors.attachment}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsCreateOpen(false);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
