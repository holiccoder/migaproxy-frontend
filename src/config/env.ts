const DEFAULT_BASE_URL = "http://localhost:4002";
const DEFAULT_API_BASE_URL = "http://localhost:8001";

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
const apiBaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_BASE_URL, DEFAULT_API_BASE_URL).replace(
  /\/api$/,
  "",
);
const apiRootUrl = `${apiBaseUrl}/api`;
const allowSearchEngineSpiders = normalizeBoolean(
  process.env.NEXT_PUBLIC_ALLOW_SEARCH_ENGINE_SPIDERS,
  false,
);

export const ENV = {
  BASE_URL: baseUrl,
  APP_BASE_URL: appBaseUrl,
  API_BASE_URL: apiBaseUrl,
  API_ROOT_URL: apiRootUrl,
  ALLOW_SEARCH_ENGINE_SPIDERS: allowSearchEngineSpiders,
} as const;
