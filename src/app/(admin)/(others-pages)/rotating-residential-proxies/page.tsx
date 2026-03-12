"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import { ENV } from "@/config/env";
import { ipmartApi } from "@/utils/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const generatePassword = (): string => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let randomPassword = "";

  for (let index = 0; index < 12; index++) {
    const randomPosition = Math.floor(Math.random() * charset.length);
    randomPassword += charset[randomPosition];
  }

  return randomPassword;
};

type ChangeProxyPasswordResponse = {
  message?: string;
  errors?: {
    new_password?: string[];
    password?: string[];
  };
  data?: {
    new_password?: string;
    password?: string;
    proxy_password?: string;
  };
};

type StoredProxyCredentials = {
  username: string;
  password: string;
};

type CountryOption = {
  code: string;
  cntry: string;
  cntry_name?: string;
  city_name?: string | null;
  state_name?: string | null;
  city?: string | null;
  state?: string | null;
};

type ProtocolOption = {
  code: string;
  desc: string;
};

type PatternOption = {
  code: string;
  desc: string;
};

type RuleOption = {
  code: string;
  desc: string;
};

type ProxyOptionsResponse = {
  countries?: CountryOption[];
  protocols?: ProtocolOption[];
  patterns?: PatternOption[];
  rules?: RuleOption[];
  test_link?: string;
};

type ProxyOptionsApiResponse = {
  data?: ProxyOptionsResponse;
};

const pickStoredString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > 0) {
      return trimmedValue;
    }
  }

  return "";
};

const getStoredLoginResponseUser = (): Record<string, unknown> | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLoginResponse = localStorage.getItem("auth_login_response");

  if (!storedLoginResponse) {
    return null;
  }

  try {
    const parsedResponse = JSON.parse(storedLoginResponse) as unknown;

    if (!parsedResponse || typeof parsedResponse !== "object") {
      return null;
    }

    const responseData = (parsedResponse as Record<string, unknown>).data;

    if (!responseData || typeof responseData !== "object") {
      return null;
    }

    const responseUser = (responseData as Record<string, unknown>).user;

    if (!responseUser || typeof responseUser !== "object") {
      return null;
    }

    return responseUser as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getStoredProxyCredentials = (): StoredProxyCredentials => {
  const fallbackPassword = "proxy-pass-123";
  const storedUser = getStoredLoginResponseUser();

  if (!storedUser) {
    return {
      username: "",
      password: fallbackPassword,
    };
  }

  return {
    username: pickStoredString(
      storedUser.proxyName,
      storedUser.proxy_username,
      storedUser.proxy_user,
      storedUser.username,
    ),
    password:
      pickStoredString(
        storedUser.proxyPwd,
        storedUser.proxy_password,
        storedUser.proxy_pass,
        storedUser.password,
      ) || fallbackPassword,
  };
};

const syncStoredProxyPassword = (nextPassword: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const storedLoginResponse = localStorage.getItem("auth_login_response");

  if (!storedLoginResponse) {
    return;
  }

  try {
    const parsedResponse = JSON.parse(storedLoginResponse) as unknown;

    if (!parsedResponse || typeof parsedResponse !== "object") {
      return;
    }

    const responseRecord = parsedResponse as Record<string, unknown>;
    const responseData =
      responseRecord.data && typeof responseRecord.data === "object"
        ? (responseRecord.data as Record<string, unknown>)
        : {};
    const responseUser =
      responseData.user && typeof responseData.user === "object"
        ? (responseData.user as Record<string, unknown>)
        : {};

    const nextResponse = {
      ...responseRecord,
      data: {
        ...responseData,
        user: {
          ...responseUser,
          proxy_password: nextPassword,
        },
      },
    };

    localStorage.setItem("auth_login_response", JSON.stringify(nextResponse));
  } catch {
    return;
  }
};

const getAuthToken = (): string | null => {
  const localToken = localStorage.getItem("auth_token");

  if (localToken) {
    return localToken;
  }

  const sessionToken = sessionStorage.getItem("auth_token");

  if (sessionToken) {
    return sessionToken;
  }

  const authCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("auth_token="));

  if (!authCookie) {
    return null;
  }

  const [, cookieValue = ""] = authCookie.split("=");
  return decodeURIComponent(cookieValue);
};

export default function RotatingResidentialProxiesPage() {
  const storedProxyCredentials = useMemo(() => getStoredProxyCredentials(), []);
  const [proxyUsername] = useState(() => storedProxyCredentials.username);
  const [proxyPassword, setProxyPassword] = useState(
    () => storedProxyCredentials.password,
  );
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [protocol, setProtocol] = useState("");
  const [proxyType, setProxyType] = useState("");
  const [proxyFormat, setProxyFormat] = useState("");
  const [protocolOptions, setProtocolOptions] = useState<{ value: string; label: string }[]>([]);
  const [proxyTypeOptions, setProxyTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [proxyFormatOptions, setProxyFormatOptions] = useState<{ value: string; label: string }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string | null>(null);

  const fetchProxyOptions = useCallback(async () => {
    const token = getAuthToken();
    try {
      const response = await ipmartApi.getProxyOptions(token ?? undefined) as unknown as ProxyOptionsApiResponse;
      const rawData = response.data as { data?: ProxyOptionsResponse } | undefined;
      const data = rawData?.data as ProxyOptionsResponse | undefined;
      if (data) {
        if (data.protocols && data.protocols.length > 0) {
          const mappedProtocols = data.protocols.map(p => ({ value: p.code, label: p.desc }));
          setProtocolOptions(mappedProtocols);
          setProtocol(mappedProtocols[0].value);
        }
        if (data.rules && data.rules.length > 0) {
          const mappedTypes = data.rules.map(r => ({ value: r.code, label: r.desc }));
          setProxyTypeOptions(mappedTypes);
          setProxyType(mappedTypes[0].value);
        }
        if (data.patterns && data.patterns.length > 0) {
          const mappedFormats = data.patterns.map(p => ({ value: p.code, label: p.desc }));
          setProxyFormatOptions(mappedFormats);
          setProxyFormat(mappedFormats[0].value);
        }
        if (data.countries && data.countries.length > 0) {
          const mappedCountries = data.countries.map(c => ({ value: c.code, label: c.cntry }));
          setCountryOptions(mappedCountries);
        }
      }
    } catch {
      // handle error silently
    }
  }, []);

  const fetchUserBalance = useCallback(() => {
    const storedUser = getStoredLoginResponseUser();
    if (storedUser && typeof storedUser.balance === "number") {
      setUserBalance(storedUser.balance);
    }
  }, []);

  useEffect(() => {
    void fetchProxyOptions();
    void fetchUserBalance();
  }, [fetchProxyOptions, fetchUserBalance]);

  const apiBaseUrl = ENV.API_BASE_URL;

  const testCommand = useMemo(() => {
    if (userBalance === 0) {
      return "";
    }
    const locationValue = selectedLocation || "all";
    const userValue = proxyUsername || "username";
    const passwordValue = proxyPassword || "password";
    const scheme = protocol.toLowerCase() === "socks5" ? "socks5" : "http";

    return `curl -x ${scheme}://gateway.example.com:10000 -U ${userValue}:${passwordValue} "https://ipinfo.io?location=${locationValue}&type=${encodeURIComponent(
      proxyType
    )}&format=${proxyFormat}"`;
  }, [selectedLocation, proxyUsername, proxyPassword, protocol, proxyType, proxyFormat, userBalance]);

  const handleCopyCommand = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(testCommand);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  const openPasswordModal = (): void => {
    setPasswordUpdateError(null);
    setPasswordUpdateSuccess(null);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = (force = false): void => {
    if (isUpdatingPassword && !force) {
      return;
    }

    setIsPasswordModalOpen(false);
    setNewPassword("");
    setPasswordUpdateError(null);
  };

  const handlePasswordUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const nextPassword = newPassword.trim();

    if (!nextPassword) {
      setPasswordUpdateError("New password is required.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setPasswordUpdateError("You are not authenticated.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordUpdateError(null);

      const response = await fetch(`${apiBaseUrl}/change-proxy-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: nextPassword,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as ChangeProxyPasswordResponse | null;

      if (!response.ok) {
        setPasswordUpdateError(
          payload?.errors?.new_password?.[0] ??
            payload?.errors?.password?.[0] ??
            payload?.message ??
            "Unable to update proxy password.",
        );
        return;
      }

      const updatedProxyPassword =
        payload?.data?.proxy_password ??
        payload?.data?.new_password ??
        payload?.data?.password ??
        nextPassword;

      setProxyPassword(updatedProxyPassword);
      syncStoredProxyPassword(updatedProxyPassword);
      setPasswordUpdateSuccess(payload?.message ?? "Proxy password updated.");
      closePasswordModal(true);
    } catch {
      setPasswordUpdateError("Unable to update proxy password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Rotating Residential Proxies" />

      <ComponentCard title="My Stats">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Available Traffic</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">0 GB</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Traffic Purchased</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">0 GB</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Current Plan</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Free</p>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Endpoint Generator">
        <form className="space-y-5">
          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              proxy username
            </label>
            <input
              type="text"
              disabled
              value={proxyUsername}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
              placeholder="Enter proxy username"
            />
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              proxy password
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                disabled
                value={proxyPassword}
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                change
              </button>
            </div>
            {passwordUpdateSuccess ? (
              <p className="text-xs text-success-600 dark:text-success-400">
                {passwordUpdateSuccess}
              </p>
            ) : null}
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              select location
            </label>
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="all">All Locations</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              protocol
            </label>
            <div className="flex flex-wrap gap-2">
              {protocolOptions.map((protocolOption) => (
                <button
                  key={protocolOption.value}
                  type="button"
                  onClick={() => setProtocol(protocolOption.value)}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium ${
                    protocol === protocolOption.value
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {protocolOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              proxy type
            </label>
            <div className="flex flex-wrap gap-2">
              {proxyTypeOptions.map((proxyTypeOption) => (
                <button
                  key={proxyTypeOption.value}
                  type="button"
                  onClick={() => setProxyType(proxyTypeOption.value)}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium capitalize ${
                    proxyType === proxyTypeOption.value
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {proxyTypeOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              proxy format
            </label>
            <div className="flex flex-wrap gap-2">
              {proxyFormatOptions.map((formatOption) => (
                <button
                  key={formatOption.value}
                  type="button"
                  onClick={() => setProxyFormat(formatOption.value)}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium ${
                    proxyFormat === formatOption.value
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {formatOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              test command
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={testCommand}
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={handleCopyCommand}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                {isCopied ? "copied" : "copy"}
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="input parameters">
        <p className="text-sm text-gray-600 dark:text-gray-300">--------</p>
      </ComponentCard>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => closePasswordModal()}
        className="max-w-[560px] p-5 lg:p-8"
      >
        <form className="space-y-5" onSubmit={handlePasswordUpdate}>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Change Proxy Password
          </h4>

          <div>
            <label
              htmlFor="current-proxy-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current password
            </label>
            <input
              id="current-proxy-password"
              type="text"
              value={proxyPassword}
              readOnly
              disabled
              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
          </div>

          <div>
            <label
              htmlFor="new-proxy-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New password
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="new-proxy-password"
                type="text"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new proxy password"
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
              <button
                type="button"
                onClick={() => setNewPassword(generatePassword())}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                generate
              </button>
            </div>
          </div>

          {passwordUpdateError ? (
            <p className="text-sm text-error-500">{passwordUpdateError}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => closePasswordModal()}
              disabled={isUpdatingPassword}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingPassword ? "saving..." : "save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
