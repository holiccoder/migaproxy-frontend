"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

type LoginErrors = {
  email?: string;
  password?: string;
};

type LoginResponse = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
  data?: {
    token?: string;
    token_type?: string;
    user?: unknown;
  };
};

export default function SignInForm() {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://sass-starter.test";
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  const clearFieldError = (field: keyof LoginErrors): void => {
    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
    }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const currentFieldErrors: LoginErrors = {};

    if (!email) {
      currentFieldErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      currentFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      currentFieldErrors.password = "Password is required.";
    }

    if (currentFieldErrors.email || currentFieldErrors.password) {
      setFieldErrors(currentFieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://sass-starter.test";
      const response = await fetch(`${apiBaseUrl}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => null)) as LoginResponse | null;

      if (!response.ok) {
        setFieldErrors({
          email: payload?.errors?.email?.[0],
          password: payload?.errors?.password?.[0],
        });
        setFormError(payload?.message ?? "Unable to login. Please try again.");
        return;
      }

      const token = payload?.data?.token;

      if (!token) {
        setFormError("Login succeeded but no token was returned.");
        return;
      }

      const tokenType = payload?.data?.token_type ?? "Bearer";
      const serializedLoginResponse = payload ? JSON.stringify(payload) : null;
      const serializedUser = payload?.data?.user
        ? JSON.stringify(payload.data.user)
        : null;
      const isSecureContext = window.location.protocol === "https:";
      const authCookieBase = `auth_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${
        isSecureContext ? "; Secure" : ""
      }`;

      if (serializedLoginResponse) {
        localStorage.setItem("auth_login_response", serializedLoginResponse);
      }

      if (isChecked) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_token_type", tokenType);

        if (serializedUser) {
          localStorage.setItem("auth_user", serializedUser);
        }

        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token_type");
        sessionStorage.removeItem("auth_user");
        document.cookie = `${authCookieBase}; Max-Age=${60 * 60 * 24 * 30}`;
      } else {
        sessionStorage.setItem("auth_token", token);
        sessionStorage.setItem("auth_token_type", tokenType);

        if (serializedUser) {
          sessionStorage.setItem("auth_user", serializedUser);
        }

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_type");
        localStorage.removeItem("auth_user");
        document.cookie = authCookieBase;
      }

      router.push("/dashboard");
    } catch {
      setFormError("Network error while signing in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to login!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <a
                href={`${apiBaseUrl}/api/v1/auth/google/redirect`}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Login with Google
              </a>
              <a
                href={`${apiBaseUrl}/api/v1/auth/github/redirect`}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 1.25C5.16751 1.25 1.25 5.20962 1.25 10.0947C1.25 13.9998 3.75876 17.3136 7.23938 18.4828C7.67751 18.5655 7.83564 18.2907 7.83564 18.0567C7.83564 17.8453 7.82876 17.1286 7.82501 16.3677C5.39688 16.9044 4.88439 15.1834 4.88439 15.1834C4.48814 14.1549 3.91626 13.8816 3.91626 13.8816C3.12439 13.3287 3.97626 13.3407 3.97626 13.3407C4.85251 13.4033 5.31376 14.2558 5.31376 14.2558C6.09251 15.6286 7.35688 15.231 7.85314 15.0015C7.93064 14.4222 8.15751 14.0261 8.40814 13.8024C6.46939 13.5755 4.43126 12.8059 4.43126 9.36614C4.43126 8.38657 4.77689 7.58708 5.34314 6.95735C5.25189 6.73042 4.94689 5.81522 5.42939 4.57416C5.42939 4.57416 6.16439 4.33474 7.83439 5.4938C8.53376 5.29489 9.28376 5.19596 10.0338 5.1922C10.7838 5.19596 11.5338 5.29489 12.2344 5.4938C13.9038 4.33474 14.6375 4.57416 14.6375 4.57416C15.1213 5.81522 14.8163 6.73042 14.725 6.95735C15.2925 7.58708 15.6369 8.38657 15.6369 9.36614C15.6369 12.8152 13.595 13.5725 11.6494 13.7949C11.9638 14.0725 12.2431 14.618 12.2431 15.4524C12.2431 16.6503 12.2325 17.7189 12.2325 18.0567C12.2325 18.2933 12.3894 18.5694 12.8338 18.4815C16.3125 17.3111 18.75 13.9985 18.75 10.0947C18.75 5.20962 14.8325 1.25 10 1.25Z"
                    fill="currentColor"
                  />
                </svg>
                Login with GitHub
              </a>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {formError ? (
                  <p className="text-sm text-error-500">{formError}</p>
                ) : null}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="info@gmail.com"
                    type="email"
                    error={Boolean(fieldErrors.email)}
                    hint={fieldErrors.email}
                    onChange={() => clearFieldError("email")}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      error={Boolean(fieldErrors.password)}
                      hint={fieldErrors.password}
                      onChange={() => clearFieldError("password")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
