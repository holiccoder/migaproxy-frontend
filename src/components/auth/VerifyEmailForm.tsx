"use client";

import Button from "@/components/ui/button/Button";
import { ENV } from "@/config/env";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("loading");
  const [message, setMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      const storedUser = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setStoredEmail(user.email);
        } catch {
          // ignore parse error
        }
      }

      const verified = searchParams.get("verified");
      if (verified === "1") {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } else if (verified === "0") {
        setStatus("error");
        setMessage("Email verification failed. The link may be invalid or expired.");
      } else {
        setStatus("idle");
        setMessage("Please check your email and click the verification link.");
      }
    };

    checkVerification();
  }, [searchParams]);

  const handleResend = async () => {
    if (!storedEmail) {
      setResendMessage("No email address found. Please log in to resend verification.");
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const apiBaseUrl = ENV.API_BASE_URL;
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

      const response = await fetch(`${apiBaseUrl}/api/v1/email/verification-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        setResendMessage("Verification email has been resent. Please check your inbox.");
      } else {
        const payload = await response.json().catch(() => null);
        setResendMessage(payload?.message ?? "Failed to resend verification email.");
      }
    } catch {
      setResendMessage("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status === "loading" ? "Checking verification status..." : message}
            </p>
          </div>

          {status === "success" && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                Your email has been verified. Redirecting to dashboard...
              </p>
              {typeof window !== "undefined" && (
                <meta httpEquiv="refresh" content="2;url=/user/dashboard" />
              )}
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
            </div>
          )}

          {status === "idle" && (
            <>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  We have sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
              </div>

              {storedEmail && (
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Verification email sent to: <span className="font-medium">{storedEmail}</span>
                </p>
              )}

              <Button
                onClick={handleResend}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? "Resending..." : "Resend Verification Email"}
              </Button>

              {resendMessage && (
                <p className={`mt-4 text-sm ${resendMessage.includes("success") || resendMessage.includes("resent") ? "text-green-600" : "text-red-600"}`}>
                  {resendMessage}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
