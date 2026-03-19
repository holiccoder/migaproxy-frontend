"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { toRelativeApiUrl } from "@/config/env";
import { useParams, useRouter } from "next/navigation";
import React, { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type SenderType = "user" | "admin";

type TicketMessage = {
  id: number;
  sender_type: SenderType;
  message: string;
  created_at: string;
};

type Ticket = {
  id: number;
  subject: string;
  category: "billing" | "technical" | "feature_request";
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  attachment_path?: string | null;
  context?: {
    browser?: string;
    os?: string;
    plan_type?: string;
  } | null;
  created_at: string;
  messages: TicketMessage[];
};

type TicketResponse = {
  message?: string;
  data?: Ticket;
};

type ReplyResponse = {
  message?: string;
  errors?: {
    message?: string[];
    attachment?: string[];
  };
};

const toStorageAssetUrl = (path: string): string => {
  const normalizedPath = path.replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/")) {
    return `/${normalizedPath}`;
  }

  return `/storage/${normalizedPath}`;
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = useMemo(() => {
    if (!params?.id) {
      return null;
    }

    if (Array.isArray(params.id)) {
      return params.id[0] ?? null;
    }

    return params.id;
  }, [params]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  const fetchTicket = useCallback(async (): Promise<void> => {
    if (!ticketId) {
      setErrorMessage("Invalid ticket id.");
      setIsLoading(false);
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setErrorMessage("You are not authenticated.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await fetch(
        `/api/v1/tickets/${encodeURIComponent(ticketId)}`,
        {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
      );

      if (!response.ok) {
        setErrorMessage("Unable to load ticket details.");
        return;
      }

      const payload = (await response.json()) as TicketResponse;
      setTicket(payload.data ?? null);
    } catch {
      setErrorMessage("Unable to load ticket details.");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    void fetchTicket();
  }, [fetchTicket, ticketId]);

  const insertFormatting = (prefix: string, suffix = ""): void => {
    setReplyMessage((previous) => `${previous}${prefix}${suffix}`);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    if (files.length === 0) {
      return;
    }

    setAttachments([files[files.length - 1]]);
  };

  const handleAttachmentSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setAttachments([files[files.length - 1]]);
    event.currentTarget.value = "";
  };

  const getAttachmentUrl = (attachmentPath: string | null | undefined): string | null => {
    if (!attachmentPath) {
      return null;
    }

    if (attachmentPath.startsWith("http://") || attachmentPath.startsWith("https://")) {
      return toRelativeApiUrl(attachmentPath);
    }

    return toStorageAssetUrl(attachmentPath);
  };

  const sendReply = async (): Promise<void> => {
    if (!ticket) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setReplyError("You are not authenticated.");
      return;
    }

    const formattedMessage = replyMessage.trim();

    if (!formattedMessage) {
      setReplyError("Reply message is required.");
      return;
    }

    setReplyError(null);
    setReplySuccess(null);
    setIsSendingReply(true);

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      let requestBody: BodyInit;

      if (attachments.length > 0) {
        const payload = new FormData();
        payload.append("message", formattedMessage);
        payload.append("attachment", attachments[0]);
        requestBody = payload;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          message: formattedMessage,
        });
      }

      const response = await fetch(`/api/v1/tickets/${ticket.id}/replies`, {
        method: "POST",
        headers,
        body: requestBody,
      });

      const responseText = await response.text();
      let payload: ReplyResponse | null = null;

      if (responseText) {
        try {
          payload = JSON.parse(responseText) as ReplyResponse;
        } catch {
          payload = null;
        }
      }

      if (!response.ok) {
        setReplyError(
          payload?.errors?.message?.[0] ??
            payload?.errors?.attachment?.[0] ??
            payload?.message ??
            `Unable to send reply. (${response.status})`
        );
        return;
      }

      setReplySuccess(payload?.message ?? "Reply added successfully.");
      setReplyMessage("");
      setAttachments([]);
      void fetchTicket();
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : "Unable to send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const closeTicket = async (): Promise<void> => {
    if (!ticket) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      return;
    }

    setIsClosing(true);

    try {
      await fetch(`/api/v1/tickets/${ticket.id}/close`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      void fetchTicket();
    } finally {
      setIsClosing(false);
    }
  };

  const exportTranscript = (): void => {
    if (!ticket) {
      return;
    }

    const transcript = ticket.messages
      .map((message) => {
        const sender = message.sender_type === "admin" ? "Staff" : "User";
        return `[${formatDate(message.created_at)}] ${sender}: ${message.message}`;
      })
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticket.id}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Ticket Detail" />

      {isLoading ? (
        <p className="py-6 text-sm text-gray-500 dark:text-gray-400">Loading ticket...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="py-6 text-sm text-error-500">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && ticket ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {ticket.subject}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ticket #{ticket.id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={closeTicket}
                  disabled={isClosing || ticket.status === "closed"}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  {isClosing ? "Closing..." : "Close Ticket"}
                </button>
                <button
                  type="button"
                  onClick={exportTranscript}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Export Transcript
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-700"
                >
                  Escalate
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-center text-xs uppercase tracking-wide text-gray-400">
                Ticket created {formatDate(ticket.created_at)}
              </p>
              {ticket.status === "closed" ? (
                <p className="text-center text-xs uppercase tracking-wide text-gray-400">
                  Ticket status changed to Closed
                </p>
              ) : null}

              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      message.sender_type === "user"
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="font-semibold">
                        {message.sender_type === "admin" ? "Staff" : "You"}
                      </span>
                      {message.sender_type === "admin" ? (
                        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium text-brand-200">
                          Official
                        </span>
                      ) : null}
                      <span className="opacity-80">{formatDate(message.created_at)}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-6">{message.message}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
              <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
                Reply
              </h4>

              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertFormatting("**bold text**")}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n- item 1\n- item 2")}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Bullet List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n```js\nconsole.log('code');\n```\n")}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Code Block
                </button>
              </div>

              <textarea
                rows={6}
                value={replyMessage}
                onChange={(event) => {
                  setReplyMessage(event.target.value);
                  setReplyError(null);
                  setReplySuccess(null);
                }}
                placeholder="Write your reply..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
              />

              <div
                role="button"
                tabIndex={0}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="mt-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
              >
                Drag and drop attachments here (screenshots, logs). The latest file
                is uploaded and saved to the ticket.
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleAttachmentSelect}
              />

              {attachments.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {attachments.map((file, index) => (
                    <li key={`${file.name}-${index}`}>{file.name}</li>
                  ))}
                </ul>
              ) : null}

              {replyError ? <p className="mt-2 text-sm text-error-500">{replyError}</p> : null}
              {replySuccess ? (
                <p className="mt-2 text-sm text-success-600 dark:text-success-400">
                  {replySuccess}
                </p>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSendingReply || ticket.status === "closed"}
                  onClick={() => {
                    void sendReply();
                  }}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSendingReply ? "Sending..." : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/user/tickets")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Back to Tickets
                </button>
              </div>
            </div>
          </div>

          <aside className="xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Metadata
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{ticket.category}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Priority</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{ticket.status}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Attachment</p>
                {ticket.attachment_path ? (
                  <a
                    href={getAttachmentUrl(ticket.attachment_path) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    View attachment
                  </a>
                ) : (
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    Not available
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Browser</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {ticket.context?.browser ?? "Not available"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">OS</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {ticket.context?.os ?? "Not available"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Plan Type</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {ticket.context?.plan_type ?? "Not available"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
