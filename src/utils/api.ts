import { ENV } from "@/config/env";

const API_BASE_URL = ENV.API_ROOT_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

const PROXY_OPTIONS_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const PROXY_OPTIONS_STORAGE_KEY = "proxy_options_cache";

type ProxyOptionsCache = { data: ApiResponse | null; timestamp: number };

let proxyOptionsCache: ProxyOptionsCache = { data: null, timestamp: 0 };

const loadCacheFromStorage = (): ProxyOptionsCache => {
  if (typeof window === "undefined") return { data: null, timestamp: 0 };
  try {
    const stored = localStorage.getItem(PROXY_OPTIONS_STORAGE_KEY);
    if (!stored) return { data: null, timestamp: 0 };
    const parsed = JSON.parse(stored) as ProxyOptionsCache;
    if (parsed?.data && typeof parsed.timestamp === "number") {
      return parsed;
    }
  } catch { /* ignore */ }
  return { data: null, timestamp: 0 };
};

const saveCacheToStorage = (cache: ProxyOptionsCache): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROXY_OPTIONS_STORAGE_KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
};

// IPmart specific API calls
export const ipmartApi = {
  getCountries: (token?: string) => apiClient.get("/v1/ipmart/countries", token),
  getStates: (countryCode: string, token?: string) =>
    apiClient.get(`/v1/ipmart/proxy-states?country_code=${countryCode}`, token),
  getProtocols: (token?: string) => apiClient.get("/v1/ipmart/protocols", token),
  getRules: (token?: string) => apiClient.get("/v1/ipmart/rules", token),
  generateProxies: (data: any, token?: string) =>
    apiClient.post("/v1/ipmart/generate", data, token),
  getProxyStates: (countryCode: string, token?: string) =>
    apiClient.get(`/v1/ipmart/proxy-states?country_code=${encodeURIComponent(countryCode)}`, token),
  getProxyCities: (countryCode: string, state: string, token?: string) =>
    apiClient.get(`/v1/ipmart/proxy-cities?country_code=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(state)}`, token),
  getProxyApiLink: (data: any, token?: string) =>
    apiClient.post("/v1/ipmart/proxy-api-link", data, token),
  getProxyOptions: async (token?: string) => {
    const now = Date.now();
    // Check in-memory cache first
    if (proxyOptionsCache.data && now - proxyOptionsCache.timestamp < PROXY_OPTIONS_CACHE_TTL) {
      return proxyOptionsCache.data;
    }
    // Fall back to localStorage cache
    const storedCache = loadCacheFromStorage();
    if (storedCache.data && now - storedCache.timestamp < PROXY_OPTIONS_CACHE_TTL) {
      proxyOptionsCache = storedCache;
      return storedCache.data;
    }
    // Fetch fresh data
    const response = await apiClient.get("/v1/ipmart/proxy-options", token);
    if (response.success) {
      const newCache = { data: response, timestamp: now };
      proxyOptionsCache = newCache;
      saveCacheToStorage(newCache);
    }
    return response;
  },
};
