import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - MigaProxy",
  description: "This is register page of MigaProxy, you can create an account here!",
};

export default function Register() {
  return <SignUpForm />;
}
