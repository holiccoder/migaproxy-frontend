"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import { type ApiResponse, ipmartApi } from "@/utils/api";
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

type GenerateTestLinkResponse = {
  data?: {
    test_link?: string;
    link?: string;
    url?: string;
    links?: string[];
  };
  test_link?: string;
  link?: string;
  url?: string;
  links?: string[];
};

type UserProfileResponse = Record<string, unknown> & {
  data?: (Record<string, unknown> & {
    user?: Record<string, unknown>;
  }) | null;
};

type ToggleTranslationGroup = "protocol" | "proxyType" | "proxyFormat";

type ToggleTranslationCache = Record<string, string>;

const TOGGLE_TRANSLATION_CACHE_KEY = "ipmart_toggle_translation_cache_v1";
const CHINESE_CHARACTER_PATTERN = /[\u3400-\u9FFF]/u;
const AVAILABLE_TRAFFIC_FIELDS = [
  "available_traffic",
  "availableTraffic",
  "traffic_available",
  "trafficAvailable",
  "remaining_traffic",
  "remainingTraffic",
  "traffic_left",
  "trafficLeft",
  "left_traffic",
  "leftTraffic",
] as const;

let cachedToggleTranslations: ToggleTranslationCache | null = null;

const KNOWN_TOGGLE_TRANSLATIONS: Record<string, string> = {
  "http协议": "HTTP",
  "socks5协议": "SOCKS5",
  "轮转": "Switch IP per request",
  "轮换": "Switch IP per request",
  "按次轮换": "Switch IP per request",
  "按会话轮换": "Sticky Session",
  "粘性": "Sticky 5-30 min",
  "长效会话": "1-6 hours",
  "短效会话": "Short Session",
  "文本": "SERVER:PORT:USERNAME:PASSWORD",
  "文本格式": "SERVER:PORT:USERNAME:PASSWORD",
  "json格式": "USERNAME:PASSWORD@SERVER:PORT",
};

const normalizeTranslationLookupKey = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const containsChineseCharacters = (value: string): boolean => {
  return CHINESE_CHARACTER_PATTERN.test(value);
};

const getToggleTranslationCache = (): ToggleTranslationCache => {
  if (cachedToggleTranslations) {
    return cachedToggleTranslations;
  }

  if (typeof window === "undefined") {
    cachedToggleTranslations = {};
    return cachedToggleTranslations;
  }

  const rawCache = localStorage.getItem(TOGGLE_TRANSLATION_CACHE_KEY);

  if (!rawCache) {
    cachedToggleTranslations = {};
    return cachedToggleTranslations;
  }

  try {
    const parsedCache = JSON.parse(rawCache) as unknown;

    if (!parsedCache || typeof parsedCache !== "object") {
      cachedToggleTranslations = {};
      return cachedToggleTranslations;
    }

    const normalizedCache: ToggleTranslationCache = {};

    Object.entries(parsedCache as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim().length > 0) {
        normalizedCache[key] = value.trim();
      }
    });

    cachedToggleTranslations = normalizedCache;

    return cachedToggleTranslations;
  } catch {
    cachedToggleTranslations = {};
    return cachedToggleTranslations;
  }
};

const persistToggleTranslationCache = (cache: ToggleTranslationCache): void => {
  cachedToggleTranslations = cache;

  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(TOGGLE_TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
};

const inferToggleLabelFromGroup = (
  group: ToggleTranslationGroup,
  code: string,
): string => {
  const normalizedCode = code.trim().toLowerCase();

  if (group === "protocol") {
    if (normalizedCode === "2") {
      return "SOCKS5";
    }

    return "HTTP";
  }

  if (group === "proxyType") {
    if (normalizedCode === "0") {
      return "Switch IP per request";
    }

    if (normalizedCode === "1") {
      return "Sticky 5-30 min";
    }

    if (normalizedCode === "2") {
      return "1-6 hours";
    }

    return `Mode ${code}`;
  }

  if (group === "proxyFormat") {
    if (normalizedCode === "0") {
      return "SERVER:PORT:USERNAME:PASSWORD";
    }

    if (normalizedCode === "1") {
      return "USERNAME:PASSWORD@SERVER:PORT";
    }

    if (normalizedCode === "2") {
      return "SERVER|PORT|USERNAME|PASSWORD";
    }

    return `Format ${code}`;
  }

  if (normalizedCode === "1" || normalizedCode === "json") {
    return "JSON";
  }

  return "Text";
};

const translateToggleLabel = (
  label: string,
  group: ToggleTranslationGroup,
  code: string,
): string => {
  const trimmedLabel = label.trim();

  if (!trimmedLabel) {
    return inferToggleLabelFromGroup(group, code);
  }

  const normalizedLabel = normalizeTranslationLookupKey(trimmedLabel);

  if (KNOWN_TOGGLE_TRANSLATIONS[normalizedLabel]) {
    return KNOWN_TOGGLE_TRANSLATIONS[normalizedLabel];
  }

  if (normalizedLabel.includes("socks")) {
    return "SOCKS5";
  }

  if (normalizedLabel.includes("http")) {
    return "HTTP";
  }

  if (normalizedLabel.includes("json")) {
    return "JSON";
  }

  if (normalizedLabel.includes("txt") || normalizedLabel.includes("text")) {
    return "Text";
  }

  if (!containsChineseCharacters(trimmedLabel)) {
    return trimmedLabel;
  }

  return inferToggleLabelFromGroup(group, code);
};

const getTranslatedToggleLabel = (
  label: string,
  group: ToggleTranslationGroup,
  code: string,
): string => {
  const trimmedLabel = label.trim();
  const cacheKey = `${group}:${code.trim()}:${trimmedLabel}`;
  const cache = getToggleTranslationCache();
  const cachedLabel = cache[cacheKey];

  if (cachedLabel) {
    return cachedLabel;
  }

  const translatedLabel = translateToggleLabel(trimmedLabel, group, code);

  if (containsChineseCharacters(trimmedLabel)) {
    const nextCache = {
      ...cache,
      [cacheKey]: translatedLabel,
    };

    persistToggleTranslationCache(nextCache);
  }

  return translatedLabel;
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

const getStoredUserId = (): string => {
  const storedUser = getStoredLoginResponseUser();

  if (!storedUser) {
    return "";
  }

  const rawUserId = storedUser.id;

  if (typeof rawUserId === "number" && Number.isFinite(rawUserId)) {
    return String(rawUserId);
  }

  if (typeof rawUserId === "string") {
    return rawUserId.trim();
  }

  return "";
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
};

const getAvailableTrafficValue = (record: Record<string, unknown> | null): unknown => {
  if (!record) {
    return undefined;
  }

  for (const field of AVAILABLE_TRAFFIC_FIELDS) {
    const fieldValue = record[field];

    if (fieldValue !== undefined && fieldValue !== null) {
      return fieldValue;
    }
  }

  return undefined;
};

const formatAvailableTraffic = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^[+-]?\d+(\.\d+)?$/.test(trimmedValue)) {
    const parsedValue = Number(trimmedValue);

    if (Number.isFinite(parsedValue)) {
      return `${parsedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`;
    }
  }

  return trimmedValue;
};

const getAvailableTrafficFromUserPayload = (
  payload: UserProfileResponse | null,
): string | null => {
  if (!payload) {
    return null;
  }

  const payloadRecord = toRecord(payload);
  const payloadData = toRecord(payloadRecord?.data);
  const payloadUser = toRecord(payloadData?.user);

  const availableTrafficValue =
    getAvailableTrafficValue(payloadRecord) ??
    getAvailableTrafficValue(payloadData) ??
    getAvailableTrafficValue(payloadUser);

  return formatAvailableTraffic(availableTrafficValue);
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

const getSelectedOptionLabel = (
  options: { value: string; label: string }[],
  selectedValue: string,
): string => {
  const matchedOption = options.find((option) => option.value === selectedValue);

  return matchedOption?.label ?? selectedValue;
};

export default function RotatingResidentialProxiesPage() {
  const storedProxyCredentials = useMemo(() => getStoredProxyCredentials(), []);
  const [proxyUsername] = useState(() => storedProxyCredentials.username);
  const [proxyPassword, setProxyPassword] = useState(
    () => storedProxyCredentials.password,
  );
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [protocol, setProtocol] = useState("");
  const [proxyType, setProxyType] = useState("");
  const [proxyFormat, setProxyFormat] = useState("");
  const [protocolOptions, setProtocolOptions] = useState<{ value: string; label: string }[]>([]);
  const [proxyTypeOptions, setProxyTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [proxyFormatOptions, setProxyFormatOptions] = useState<{ value: string; label: string }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [testCommand, setTestCommand] = useState("");
  const [isRefreshingTestCommand, setIsRefreshingTestCommand] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string | null>(null);
  const [availableTraffic, setAvailableTraffic] = useState("0 GB");

  const fetchProxyOptions = useCallback(async () => {
    const token = getAuthToken();
    try {
      const response = await ipmartApi.getProxyOptions(token ?? undefined) as unknown as ProxyOptionsApiResponse;
      const rawData = response.data as { data?: ProxyOptionsResponse } | undefined;
      const data = rawData?.data as ProxyOptionsResponse | undefined;
      if (data) {
        if (data.protocols && data.protocols.length > 0) {
          const mappedProtocols = data.protocols.map((protocolOption) => ({
            value: protocolOption.code,
            label: getTranslatedToggleLabel(
              protocolOption.desc,
              "protocol",
              protocolOption.code,
            ),
          }));
          setProtocolOptions(mappedProtocols);
          setProtocol(mappedProtocols[0].value);
        }
        if (data.rules && data.rules.length > 0) {
          const mappedTypes = data.rules.map((ruleOption) => ({
            value: ruleOption.code,
            label: getTranslatedToggleLabel(
              ruleOption.desc,
              "proxyType",
              ruleOption.code,
            ),
          }));
          setProxyTypeOptions(mappedTypes);
          setProxyType(mappedTypes[0].value);
        }
        if (data.patterns && data.patterns.length > 0) {
          const mappedFormats = data.patterns.map((patternOption) => ({
            value: patternOption.code,
            label: getTranslatedToggleLabel(
              patternOption.desc,
              "proxyFormat",
              patternOption.code,
            ),
          }));
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

  const fetchAvailableTraffic = useCallback(async (): Promise<void> => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response
        .json()
        .catch(() => null)) as UserProfileResponse | null;
      const nextAvailableTraffic = getAvailableTrafficFromUserPayload(payload);

      if (nextAvailableTraffic) {
        setAvailableTraffic(nextAvailableTraffic);
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    void fetchProxyOptions();
  }, [fetchProxyOptions]);

  useEffect(() => {
    void fetchAvailableTraffic();
  }, [fetchAvailableTraffic]);

  const selectedCountryName = useMemo(() => {
    if (selectedLocation === "all") {
      return "all";
    }

    return getSelectedOptionLabel(countryOptions, selectedLocation);
  }, [countryOptions, selectedLocation]);

  const selectedStateName = useMemo(() => {
    if (selectedState === "all") {
      return "all";
    }

    return getSelectedOptionLabel(stateOptions, selectedState);
  }, [selectedState, stateOptions]);

  const selectedCityName = useMemo(() => {
    if (selectedCity === "all") {
      return "all";
    }

    return getSelectedOptionLabel(cityOptions, selectedCity);
  }, [cityOptions, selectedCity]);

  const selectedProtocolLabel = useMemo(() => {
    if (!protocol) {
      return "";
    }

    return getSelectedOptionLabel(protocolOptions, protocol);
  }, [protocol, protocolOptions]);

  const selectedProxyTypeLabel = useMemo(() => {
    if (!proxyType) {
      return "";
    }

    return getSelectedOptionLabel(proxyTypeOptions, proxyType);
  }, [proxyType, proxyTypeOptions]);

  const selectedProxyFormatLabel = useMemo(() => {
    if (!proxyFormat) {
      return "";
    }

    return getSelectedOptionLabel(proxyFormatOptions, proxyFormat);
  }, [proxyFormat, proxyFormatOptions]);

  const fallbackTestCommand = useMemo(() => {
    const locationValue = selectedLocation || "all";
    const userValue = proxyUsername || "username";
    const passwordValue = proxyPassword || "password";
    const normalizedProtocol = selectedProtocolLabel.toLowerCase();
    const scheme = normalizedProtocol.includes("socks") ? "socks5" : "http";

    return `curl -x ${scheme}://gateway.example.com:10000 -U ${userValue}:${passwordValue} "https://ipinfo.io?location=${locationValue}&type=${encodeURIComponent(
      proxyType
    )}&format=${proxyFormat}"`;
  }, [selectedLocation, proxyUsername, proxyPassword, selectedProtocolLabel, proxyType, proxyFormat]);

  const refreshGeneratedTestLink = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    const userId = getStoredUserId();

    if (!token || !protocol || !proxyType || !proxyFormat) {
      setTestCommand(fallbackTestCommand);
      return;
    }

    setIsRefreshingTestCommand(true);

    try {
      const response = (await ipmartApi.generateTestLink(
        {
          user_id: userId || undefined,
          country_name: selectedCountryName,
          state_name: selectedStateName,
          city_name: selectedCityName,
          protocol: protocol,
          proxy_type: proxyType,
          proxy_format: proxyFormat,
          country_code: selectedLocation,
          state_code: selectedState,
          city_code: selectedCity,
          protocol_name: selectedProtocolLabel,
          proxy_type_name: selectedProxyTypeLabel,
          proxy_format_name: selectedProxyFormatLabel,
        },
        token,
      )) as ApiResponse<GenerateTestLinkResponse>;

      const nextTestCommand =
        response.data?.data?.test_link ??
        response.data?.data?.link ??
        response.data?.data?.url ??
        response.data?.data?.links?.[0] ??
        response.data?.test_link ??
        response.data?.link ??
        response.data?.url ??
        response.data?.links?.[0] ??
        fallbackTestCommand;

      setTestCommand(nextTestCommand);
    } catch {
      setTestCommand(fallbackTestCommand);
    } finally {
      setIsRefreshingTestCommand(false);
    }
  }, [
    fallbackTestCommand,
    protocol,
    proxyFormat,
    proxyType,
    selectedCity,
    selectedCityName,
    selectedCountryName,
    selectedLocation,
    selectedProtocolLabel,
    selectedProxyFormatLabel,
    selectedProxyTypeLabel,
    selectedState,
    selectedStateName,
  ]);

  useEffect(() => {
    void refreshGeneratedTestLink();
  }, [refreshGeneratedTestLink]);

  const displayTestCommand = testCommand || fallbackTestCommand;

  const handleCopyCommand = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(displayTestCommand);
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

      const response = await fetch(`/api/v1/ipmart/change-proxy-password`, {
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
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{availableTraffic}</p>
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Proxy username
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Proxy password
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Select location
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={selectedLocation}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedLocation(value);
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
                  if (value !== "all" && selectedLocation !== "all") {
                    void fetchCities(selectedLocation, value);
                  }
                }}
                disabled={selectedLocation === "all" || loadingStates}
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Protocol
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Proxy type
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Proxy format
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
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Test command
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={displayTestCommand}
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
              <button
                type="button"
                onClick={handleCopyCommand}
                disabled={isRefreshingTestCommand}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                {isRefreshingTestCommand ? "updating..." : isCopied ? "copied" : "copy"}
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
