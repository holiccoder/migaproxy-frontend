import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Migaproxy",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
