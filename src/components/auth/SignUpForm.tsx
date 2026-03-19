"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { FormEvent, useState } from "react";

type RegisterErrors = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
};

type RegisterResponse = {
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
  };
  data?: {
    token?: string;
    token_type?: string;
    user?: unknown;
  };
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/;
const PASSWORD_ERROR_MESSAGE =
  "Password must be 8 to 32 characters and include both letters and numbers.";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});

  const clearFieldError = (field: keyof RegisterErrors): void => {
    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
    }));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!isChecked) {
      setFormError("You must accept the Terms and Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    setFieldErrors({});

    const formData = new FormData(form);
    const firstName = String(formData.get("first_name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("password_confirmation") ?? "");
    const name = `${firstName} ${lastName}`.trim();
    const currentFieldErrors: RegisterErrors = {};

    if (!firstName) {
      currentFieldErrors.first_name = "First name is required.";
    }

    if (!lastName) {
      currentFieldErrors.last_name = "Last name is required.";
    }

    if (!email) {
      currentFieldErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      currentFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      currentFieldErrors.password = "Password is required.";
    } else if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      currentFieldErrors.password = PASSWORD_ERROR_MESSAGE;
    } else if (!PASSWORD_PATTERN.test(password)) {
      currentFieldErrors.password = PASSWORD_ERROR_MESSAGE;
    }

    if (!passwordConfirmation) {
      currentFieldErrors.password_confirmation = "Please confirm your password.";
    } else if (password !== passwordConfirmation) {
      currentFieldErrors.password_confirmation = "Password confirmation does not match.";
    }

    if (
      currentFieldErrors.first_name ||
      currentFieldErrors.last_name ||
      currentFieldErrors.email ||
      currentFieldErrors.password ||
      currentFieldErrors.password_confirmation
    ) {
      setFieldErrors(currentFieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const payload = (await response.json().catch(() => null)) as RegisterResponse | null;

      if (!response.ok) {
        setFieldErrors({
          email: payload?.errors?.email?.[0],
          password: payload?.errors?.password?.[0],
          password_confirmation: payload?.errors?.password_confirmation?.[0],
        });
        setFormError(payload?.message ?? "Unable to register. Please try again.");
        return;
      }

      const verificationMessage =
        payload?.message ??
        `Registration successful. Please verify ${email} before logging in.`;

      form.reset();
      setIsChecked(false);
      setShowPassword(false);
      setShowPasswordConfirmation(false);
      setFieldErrors({});
      setFormError(null);
      setFormSuccess(verificationMessage);
    } catch {
      setFormError("Network error while registering. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:order-2 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>

            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {formError ? (
                  <p className="text-sm text-error-500">{formError}</p>
                ) : null}
                {formSuccess ? (
                  <p className="text-sm text-success-600 dark:text-success-400">{formSuccess}</p>
                ) : null}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="first_name"
                      name="first_name"
                      placeholder="Enter your first name"
                      error={Boolean(fieldErrors.first_name)}
                      hint={fieldErrors.first_name}
                      onChange={() => clearFieldError("first_name")}
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="last_name"
                      name="last_name"
                      placeholder="Enter your last name"
                      error={Boolean(fieldErrors.last_name)}
                      hint={fieldErrors.last_name}
                      onChange={() => clearFieldError("last_name")}
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    error={Boolean(fieldErrors.email)}
                    hint={fieldErrors.email}
                    onChange={() => clearFieldError("email")}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
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
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      placeholder="Confirm your password"
                      type={showPasswordConfirmation ? "text" : "password"}
                      error={Boolean(fieldErrors.password_confirmation)}
                      hint={fieldErrors.password_confirmation}
                      onChange={() => clearFieldError("password_confirmation")}
                    />
                    <span
                      onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                      }
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPasswordConfirmation ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={(checked) => {
                      setIsChecked(checked);
                      setFormError(null);
                      setFormSuccess(null);
                    }}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-gray-800 underline transition-colors hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400"
                    >
                      Terms and Conditions
                    </Link>
                    , and our{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-gray-800 underline transition-colors hover:text-brand-500 dark:text-white dark:hover:text-brand-400"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
