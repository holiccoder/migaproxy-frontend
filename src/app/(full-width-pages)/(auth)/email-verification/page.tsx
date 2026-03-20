import EmailVerificationTransition from "@/components/auth/EmailVerificationTransition";
import type { Metadata } from "next";
import { Suspense } from "react";

const verificationLoadingFallback = (
  <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:w-3/5">
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
      Loading verification status...
    </div>
  </div>
);

export const metadata: Metadata = {
  title: "Email Verification - MigaProxy",
  description: "Verifying your email and signing you in.",
};

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={verificationLoadingFallback}>
      <EmailVerificationTransition />
    </Suspense>
  );
}
