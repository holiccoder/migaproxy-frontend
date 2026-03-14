import { ENV } from "@/config/env";

const API_ROOT_URL = ENV.API_ROOT_URL;

const normalizeEndpoint = (endpoint: string): string => endpoint.replace(/^\/+/, "");

export async function apiGet<T>(endpoint: string): Promise<T> {
  const url = `${API_ROOT_URL}/${normalizeEndpoint(endpoint)}`;
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
