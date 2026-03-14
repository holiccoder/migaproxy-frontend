import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Reset Password Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Reset Password page TailAdmin Dashboard Template",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
