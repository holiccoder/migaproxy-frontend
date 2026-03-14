import { ENV } from "@/config/env";

const API_ROOT_URL = ENV.API_ROOT_URL;

const normalizeEndpoint = (endpoint: string): string => endpoint.replace(/^\/+/, "");
const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const toRequestUrl = (endpoint: string): string => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  if (isAbsoluteUrl(normalizedEndpoint)) {
    return normalizedEndpoint;
  }

  return `${API_ROOT_URL}/${normalizedEndpoint}`;
};

export async function apiGet<T>(endpoint: string): Promise<T> {
  const url = toRequestUrl(endpoint);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
