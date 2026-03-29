const AFFILIATE_STORAGE_KEY = "affiliate_attribution";
const AFFILIATE_COOKIE_KEY = "affiliate_code";
const AFFILIATE_TRACKED_SESSION_PREFIX = "affiliate_click_tracked";
const DEFAULT_AFFILIATE_ATTRIBUTION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const AFFILIATE_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

type StoredAffiliateAttribution = {
  code: string;
  capturedAt: number;
  expiresAt: number;
};

export const AFFILIATE_QUERY_PARAM = "affiliate_code";

const isBrowser = (): boolean => {
  return typeof window !== "undefined";
};

const readCookie = (name: string): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const targetCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) {
    return null;
  }

  const [, rawValue = ""] = targetCookie.split("=");
  const decodedValue = decodeURIComponent(rawValue);
  return decodedValue.trim() || null;
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number): void => {
  if (!isBrowser()) {
    return;
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${Math.max(1, Math.floor(maxAgeSeconds))}${secureAttribute}`;
};

const clearCookie = (name: string): void => {
  if (!isBrowser()) {
    return;
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0${secureAttribute}`;
};

const parseStoredAttribution = (rawValue: string | null): StoredAffiliateAttribution | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredAffiliateAttribution>;

    if (
      typeof parsedValue.code !== "string"
      || typeof parsedValue.capturedAt !== "number"
      || typeof parsedValue.expiresAt !== "number"
    ) {
      return null;
    }

    return {
      code: parsedValue.code,
      capturedAt: parsedValue.capturedAt,
      expiresAt: parsedValue.expiresAt,
    };
  } catch {
    return null;
  }
};

export const normalizeAffiliateCode = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!AFFILIATE_CODE_PATTERN.test(trimmedValue)) {
    return null;
  }

  return trimmedValue;
};

export const clearStoredAffiliateCode = (): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  } catch {
    // ignore storage access errors
  }

  clearCookie(AFFILIATE_COOKIE_KEY);
};

export const setStoredAffiliateCode = (
  code: string,
  ttlMs: number = DEFAULT_AFFILIATE_ATTRIBUTION_TTL_MS,
): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const normalizedCode = normalizeAffiliateCode(code);

  if (!normalizedCode) {
    return null;
  }

  const now = Date.now();
  const maxAgeSeconds = ttlMs / 1000;
  const attribution: StoredAffiliateAttribution = {
    code: normalizedCode,
    capturedAt: now,
    expiresAt: now + Math.max(1, ttlMs),
  };

  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // ignore storage access errors
  }

  writeCookie(AFFILIATE_COOKIE_KEY, normalizedCode, maxAgeSeconds);

  return normalizedCode;
};

export const getStoredAffiliateCode = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const now = Date.now();

  try {
    const storedAttribution = parseStoredAttribution(localStorage.getItem(AFFILIATE_STORAGE_KEY));

    if (storedAttribution) {
      const normalizedCode = normalizeAffiliateCode(storedAttribution.code);

      if (normalizedCode && storedAttribution.expiresAt > now) {
        return normalizedCode;
      }
    }
  } catch {
    // ignore storage access errors
  }

  const cookieCode = normalizeAffiliateCode(readCookie(AFFILIATE_COOKIE_KEY));

  if (cookieCode) {
    setStoredAffiliateCode(cookieCode);
    return cookieCode;
  }

  clearStoredAffiliateCode();
  return null;
};

const toTrackedSessionStorageKey = (code: string): string => {
  return `${AFFILIATE_TRACKED_SESSION_PREFIX}:${code}`;
};

export const hasTrackedAffiliateClickInSession = (code: string): boolean => {
  if (!isBrowser()) {
    return false;
  }

  const normalizedCode = normalizeAffiliateCode(code);

  if (!normalizedCode) {
    return false;
  }

  try {
    return sessionStorage.getItem(toTrackedSessionStorageKey(normalizedCode)) === "1";
  } catch {
    return false;
  }
};

export const markAffiliateClickTrackedInSession = (code: string): void => {
  if (!isBrowser()) {
    return;
  }

  const normalizedCode = normalizeAffiliateCode(code);

  if (!normalizedCode) {
    return;
  }

  try {
    sessionStorage.setItem(toTrackedSessionStorageKey(normalizedCode), "1");
  } catch {
    // ignore storage access errors
  }
};
