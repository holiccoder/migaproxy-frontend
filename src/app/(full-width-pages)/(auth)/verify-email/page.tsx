import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email | Migaproxy",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-gray-500">Loading verification status...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
