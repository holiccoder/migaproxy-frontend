import { ENV } from "@/config/env";

const API_ROOT_URL = ENV.API_ROOT_URL.replace(/\/+$/, "");
const SERVER_APP_ORIGIN = ENV.APP_BASE_URL.replace(/\/+$/, "");
let hasEnabledInsecureTlsForLocalDev = false;

const normalizeEndpoint = (endpoint: string): string => endpoint.replace(/^\/+/, "");
const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const toRequestUrl = (endpoint: string): string => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  if (isAbsoluteUrl(normalizedEndpoint)) {
    return normalizedEndpoint;
  }

  const appOrigin = typeof window === "undefined" ? SERVER_APP_ORIGIN : "";

  if (normalizedEndpoint.startsWith("api/")) {
    return `${appOrigin}/${normalizedEndpoint}`;
  }

  return `${appOrigin}${API_ROOT_URL}/${normalizedEndpoint}`;
};

const shouldUseInsecureTlsFallback = (url: string): boolean => {
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".test");
  } catch {
    return false;
  }
};

export async function apiGet<T>(endpoint: string): Promise<T> {
  const url = toRequestUrl(endpoint);
  const requestOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let response: Response;

  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    if (!shouldUseInsecureTlsFallback(url)) {
      throw error;
    }

    if (!hasEnabledInsecureTlsForLocalDev) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      hasEnabledInsecureTlsForLocalDev = true;
    }

    response = await fetch(url, requestOptions);
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
