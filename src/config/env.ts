const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "http://localhost:4002";
const API_PROXY_PATH_PREFIX = "/api";

const trimTrailingSlashes = (value: string): string => {
  return value.replace(/\/+$/, "");
};

const normalizeUrl = (value: string | undefined, fallback: string): string => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return fallback;
  }

  return trimTrailingSlashes(trimmedValue);
};

const normalizeBoolean = (value: string | undefined, fallback: boolean): boolean => {
  const trimmedValue = value?.trim().toLowerCase();

  if (!trimmedValue) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(trimmedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(trimmedValue)) {
    return false;
  }

  return fallback;
};

const baseUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_BASE_URL,
  DEFAULT_BASE_URL,
);

const appBaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_BASE_URL, baseUrl);
const apiBaseUrl = appBaseUrl;
const apiRootUrl = API_PROXY_PATH_PREFIX;
const allowSearchEngineSpiders = normalizeBoolean(
  process.env.NEXT_PUBLIC_ALLOW_SEARCH_ENGINE_SPIDERS,
  false,
);

export const ENV = {
  BASE_URL: baseUrl,
  APP_BASE_URL: appBaseUrl,
  API_BASE_URL: apiBaseUrl,
  API_ROOT_URL: apiRootUrl,
  API_ASSET_URL: apiBaseUrl,
  ALLOW_SEARCH_ENGINE_SPIDERS: allowSearchEngineSpiders,
} as const;

/**
 * Convert an absolute backend API URL to a relative path so the request
 * goes through the Next.js internal API proxy (avoids CORS).
 *
 * Example: "http://127.0.0.1:8001/api/v1/notifications?page=2" → "/api/v1/notifications?page=2"
 */
export const toRelativeApiUrl = (absoluteUrl: string): string => {
  if (!absoluteUrl) {
    return absoluteUrl;
  }

  try {
    const parsed = new URL(absoluteUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return absoluteUrl;
  }
};

