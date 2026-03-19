import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - MigaProxy",
  description: "This is sign in page of MigaProxy, you can sign in to your account here!",
};

export default function SignIn() {
  return <SignInForm />;
}
