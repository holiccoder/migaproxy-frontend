"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ipmartApi } from "@/utils/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type CountryOption = {
  code: string;
  cntry: string;
};

type ProxyOptionsData = {
  countries?: CountryOption[];
};

const extractFormats = ["txt", "json"] as const;

const getAuthToken = (): string | null => {
  const localToken = localStorage.getItem("auth_token");
  if (localToken) return localToken;
  const sessionToken = sessionStorage.getItem("auth_token");
  if (sessionToken) return sessionToken;
  const authCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("auth_token="));
  if (!authCookie) return null;
  const [, cookieValue = ""] = authCookie.split("=");
  return decodeURIComponent(cookieValue);
};

export default function RotatingResidentialApiPage() {
  const [location, setLocation] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [extractFormat, setExtractFormat] = useState<(typeof extractFormats)[number]>("txt");
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(5);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [allowlistIp, setAllowlistIp] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  const fetchProxyOptions = useCallback(async () => {
    const token = getAuthToken();
    try {
      const response = await ipmartApi.getProxyOptions(token ?? undefined) as unknown as { data?: { data?: ProxyOptionsData } };
      const data = response.data?.data;
      if (data?.countries && data.countries.length > 0) {
        setCountryOptions(data.countries.map(c => ({ value: c.code, label: c.cntry })));
      }
    } catch {
      // handle error silently
    }
  }, []);

  useEffect(() => {
    void fetchProxyOptions();
  }, [fetchProxyOptions]);

  const fetchStates = useCallback(async (countryCode: string) => {
    const token = getAuthToken();
    setLoadingStates(true);
    try {
      const response = await ipmartApi.getProxyStates(countryCode, token ?? undefined);
      const raw = response.data as any;
      const states: any[] = raw?.data?.states ?? raw?.data ?? raw?.states ?? (Array.isArray(raw) ? raw : []);
      if (Array.isArray(states) && states.length > 0) {
        setStateOptions(states.map((s: any) => ({
          value: s.state ?? s.code ?? s.state_name ?? "",
          label: s.state_name ?? s.state ?? s.name ?? "",
        })));
      } else {
        setStateOptions([]);
      }
    } catch {
      setStateOptions([]);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const fetchCities = useCallback(async (countryCode: string, state: string) => {
    const token = getAuthToken();
    setLoadingCities(true);
    try {
      const response = await ipmartApi.getProxyCities(countryCode, state, token ?? undefined);
      const raw = response.data as any;
      const cities: any[] = raw?.data?.cities ?? raw?.data ?? raw?.cities ?? (Array.isArray(raw) ? raw : []);
      if (Array.isArray(cities) && cities.length > 0) {
        setCityOptions(cities.map((c: any) => ({
          value: c.city ?? c.code ?? c.city_name ?? "",
          label: c.city_name ?? c.city ?? c.name ?? "",
        })));
      } else {
        setCityOptions([]);
      }
    } catch {
      setCityOptions([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const generatedLink = useMemo(() => {
    const params = new URLSearchParams({
      location,
      format: extractFormat,
      qty: String(Math.max(1, quantity)),
      duration: String(Math.max(5, duration)),
    });

    return `https://api.example.com/residential-proxy?${params.toString()}`;
  }, [location, extractFormat, quantity, duration]);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(link || generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleGenerateLink = async (): Promise<void> => {
    const token = getAuthToken();
    setGeneratingLink(true);
    try {
      const response = await ipmartApi.getProxyApiLink(
        {
          cntryCode: location === "all" ? undefined : location,
          stateName: selectedState === "all" ? undefined : selectedState,
          cityName: selectedCity === "all" ? undefined : selectedCity,
          format: extractFormat,
          num: Math.max(1, quantity),
          time: Math.max(5, duration),
        },
        token ?? undefined,
      );
      const raw = response.data as any;
      const generatedUrl = raw?.data?.link ?? raw?.data?.url ?? raw?.link ?? raw?.url ?? "";
      if (generatedUrl) {
        setLink(generatedUrl);
      } else {
        setLink(generatedLink);
      }
    } catch {
      setLink(generatedLink);
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Rotating Residential API" />

      <ComponentCard title="proxy setup">
        <form className="space-y-5">
          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              select location
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={location}
                onChange={(event) => {
                  const value = event.target.value;
                  setLocation(value);
                  setSelectedState("all");
                  setSelectedCity("all");
                  setStateOptions([]);
                  setCityOptions([]);
                  if (value !== "all") {
                    void fetchStates(value);
                  }
                }}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="all">All Locations</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedState(value);
                  setSelectedCity("all");
                  setCityOptions([]);
                  if (value !== "all" && location !== "all") {
                    void fetchCities(location, value);
                  }
                }}
                disabled={location === "all" || loadingStates}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">{loadingStates ? "Loading..." : "All States"}</option>
                {stateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                disabled={selectedState === "all" || loadingCities}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">{loadingCities ? "Loading..." : "All Cities"}</option>
                {cityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              extract format
            </label>
            <div className="flex flex-wrap gap-2">
              {extractFormats.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setExtractFormat(format)}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium uppercase ${
                    extractFormat === format
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              qty
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              duration (5-30 minutes)
            </label>
            <input
              type="number"
              min={5}
              max={30}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value) || 5)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>

          <div className="grid items-center gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              link
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder={generatedLink}
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  {copied ? "copied" : "copy"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleGenerateLink()}
                  disabled={generatingLink}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingLink ? "generating..." : "generate link"}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(link || generatedLink, "_blank", "noopener,noreferrer")}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  get
                </button>
              </div>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Allowlist IP">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="grid items-start gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
            <label className="mt-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              add allowlist ip (comma separated)
            </label>
            <div className="space-y-3">
              <textarea
                value={allowlistIp}
                onChange={(event) => setAllowlistIp(event.target.value)}
                placeholder="e.g. 192.168.1.1, 10.0.0.1"
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600"
              >
                submit
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
