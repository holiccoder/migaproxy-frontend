"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type VerificationStatus = "idle" | "verifying" | "error";

type VerifyEmailResponse = {
  message?: string;
  data?: {
    token?: string;
    token_type?: string;
    user?: unknown;
  };
};

const DASHBOARD_PATH = "/user/dashboard";
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export default function EmailVerificationTransition() {
  const searchParams = useSearchParams();
  const processedVerificationKeyRef = useRef<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verificationId = searchParams.get("id");
  const verificationHash = searchParams.get("hash");
  const verificationExpires = searchParams.get("expires");
  const verificationSignature = searchParams.get("signature");

  useEffect(() => {
    if (!verificationId || !verificationHash || !verificationExpires || !verificationSignature) {
      setStatus("error");
      setErrorMessage(
        "Verification link is invalid or incomplete. Please request a new verification email.",
      );
      return;
    }

    const verificationKey = [
      verificationId,
      verificationHash,
      verificationExpires,
      verificationSignature,
    ].join(":");

    if (processedVerificationKeyRef.current === verificationKey) {
      return;
    }

    processedVerificationKeyRef.current = verificationKey;
    setStatus("verifying");
    setErrorMessage(null);

    const verifyEmail = async (): Promise<void> => {
      const verificationQuery = new URLSearchParams({
        expires: verificationExpires,
        signature: verificationSignature,
      });

      try {
        const response = await fetch(
          `/api/v1/email/verify/${encodeURIComponent(verificationId)}/${encodeURIComponent(verificationHash)}?${verificationQuery.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const payload = (await response.json().catch(() => null)) as VerifyEmailResponse | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to verify email. Please request a new verification email.");
        }

        const token = payload?.data?.token;

        if (!token) {
          throw new Error("Email verified but no login token was returned.");
        }

        const tokenType = payload?.data?.token_type ?? "Bearer";
        const serializedLoginResponse = payload ? JSON.stringify(payload) : null;
        const serializedUser = payload?.data?.user ? JSON.stringify(payload.data.user) : null;
        const isSecureContext = window.location.protocol === "https:";

        if (serializedLoginResponse) {
          localStorage.setItem("auth_login_response", serializedLoginResponse);
        }

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_token_type", tokenType);

        if (serializedUser) {
          localStorage.setItem("auth_user", serializedUser);
        } else {
          localStorage.removeItem("auth_user");
        }

        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token_type");
        sessionStorage.removeItem("auth_user");

        document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}${
          isSecureContext ? "; Secure" : ""
        }`;

        window.location.replace(DASHBOARD_PATH);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify email. Please request a new verification email.",
        );
      }
    };

    void verifyEmail();
  }, [verificationExpires, verificationHash, verificationId, verificationSignature]);

  const statusMessage =
    status === "verifying"
      ? "Verifying your email and signing you in..."
      : status === "error"
      ? errorMessage
      : "Preparing email verification...";

  return (
    <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:w-3/5">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Email Verification</h1>
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-error-500 dark:text-error-400" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {statusMessage}
        </p>

        {status === "error" ? (
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
          >
            Go to login
          </Link>
        ) : null}
      </div>
    </div>
  );
}
