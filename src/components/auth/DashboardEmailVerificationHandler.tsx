"use client";

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

export default function DashboardEmailVerificationHandler() {
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
        const serializedUser = payload?.data?.user
          ? JSON.stringify(payload.data.user)
          : null;
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
  }, [
    verificationExpires,
    verificationHash,
    verificationId,
    verificationSignature,
  ]);

  if (status === "verifying") {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
        Verifying your email and signing you in...
      </div>
    );
  }

  if (status === "error" && errorMessage) {
    return (
      <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-200">
        {errorMessage}
      </div>
    );
  }

  return null;
}
