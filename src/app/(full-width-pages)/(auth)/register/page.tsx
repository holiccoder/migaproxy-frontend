import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Register Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Register Page TailAdmin Dashboard Template",
  // other metadata
};

export default function Register() {
  return <SignUpForm />;
}
