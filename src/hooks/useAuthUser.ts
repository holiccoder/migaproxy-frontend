"use client";

import { useCallback, useEffect, useState } from "react";
import { ENV } from "@/config/env";

type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  balance?: number | null;
  avatar_url?: string | null;
  avatar_path?: string | null;
  skype_profile?: string | null;
  telegram_profile?: string | null;
  facebook_profile?: string | null;
  x_profile?: string | null;
  youtube_profile?: string | null;
  instagram_profile?: string | null;
};

type UseAuthUserResult = {
  user: AuthUser | null;
  isLoading: boolean;
  errorMessage: string | null;
  refreshUser: () => Promise<void>;
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

const parseJsonRecord = (rawValue: string | null): Record<string, unknown> | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    return parsedValue as Record<string, unknown>;
  } catch {
    return null;
  }
};

const toNullableString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const toNullableNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const toAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const userRecord = value as Record<string, unknown>;
  const userId = userRecord.id;
  const normalizedName = toNullableString(userRecord.name);
  const normalizedEmail = toNullableString(userRecord.email);
  const hasMeaningfulData =
    typeof userId === "number" ||
    typeof userId === "string" ||
    Boolean(normalizedName) ||
    Boolean(normalizedEmail);

  if (!hasMeaningfulData) {
    return null;
  }

  const id =
    typeof userId === "number" || typeof userId === "string"
      ? userId
      : "local-user";
  const name = normalizedName ?? "User";
  const email = normalizedEmail ?? "";

  return {
    id,
    name,
    email,
    balance: toNullableNumber(userRecord.balance),
    avatar_url: toNullableString(userRecord.avatar_url),
    avatar_path: toNullableString(userRecord.avatar_path),
    skype_profile: toNullableString(userRecord.skype_profile),
    telegram_profile: toNullableString(userRecord.telegram_profile),
    facebook_profile: toNullableString(userRecord.facebook_profile),
    x_profile: toNullableString(userRecord.x_profile),
    youtube_profile: toNullableString(userRecord.youtube_profile),
    instagram_profile: toNullableString(userRecord.instagram_profile),
  };
};

const getStoredLoginResponseUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const loginResponseRecord = parseJsonRecord(
    localStorage.getItem("auth_login_response"),
  );

  if (!loginResponseRecord) {
    return null;
  }

  const payloadData = loginResponseRecord.data;

  if (!payloadData || typeof payloadData !== "object") {
    return null;
  }

  return toAuthUser((payloadData as Record<string, unknown>).user);
};

const getStoredAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const localStorageUser = toAuthUser(
    parseJsonRecord(localStorage.getItem("auth_user")),
  );

  if (localStorageUser) {
    return localStorageUser;
  }

  const sessionStorageUser = toAuthUser(
    parseJsonRecord(sessionStorage.getItem("auth_user")),
  );

  if (sessionStorageUser) {
    return sessionStorageUser;
  }

  return getStoredLoginResponseUser();
};

const syncStoredLoginResponseUser = (user: AuthUser): void => {
  if (typeof window === "undefined") {
    return;
  }

  const loginResponseRecord = parseJsonRecord(
    localStorage.getItem("auth_login_response"),
  );

  if (!loginResponseRecord) {
    return;
  }

  const currentData = loginResponseRecord.data;
  const dataRecord =
    currentData && typeof currentData === "object"
      ? (currentData as Record<string, unknown>)
      : {};
  const dataUser = dataRecord.user;

  const nextLoginResponse = {
    ...loginResponseRecord,
    data: {
      ...dataRecord,
      user: {
        ...(dataUser && typeof dataUser === "object"
          ? (dataUser as Record<string, unknown>)
          : {}),
        ...user,
      },
    },
  };

  localStorage.setItem("auth_login_response", JSON.stringify(nextLoginResponse));
};

export const splitName = (fullName: string | null | undefined): { firstName: string; lastName: string } => {
  const safeName = (fullName ?? "").trim();

  if (!safeName) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = safeName.split(/\s+/);

  return {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
  };
};

export const useAuthUser = (): UseAuthUserResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUser = useCallback(async (): Promise<void> => {
    const token = getAuthToken();

    if (!token) {
      setErrorMessage("No auth token found.");
      setUser((previousUser) => previousUser ?? getStoredAuthUser());
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage(null);
      const apiBaseUrl = ENV.API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setErrorMessage("Unable to load user profile.");
        setUser((previousUser) => previousUser ?? getStoredAuthUser());
        return;
      }

      const payload = (await response.json()) as AuthUser;
      const avatarUrl = payload.avatar_url
        ? payload.avatar_url
        : payload.avatar_path
        ? `${apiBaseUrl}/storage/${payload.avatar_path}`
        : null;

      const nextUser = {
        ...payload,
        avatar_url: avatarUrl,
      };

      setUser(nextUser);
      syncStoredLoginResponseUser(nextUser);
    } catch {
      setErrorMessage("Unable to load user profile.");
      setUser((previousUser) => previousUser ?? getStoredAuthUser());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      void fetchUser();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [fetchUser]);

  return { user, isLoading, errorMessage, refreshUser: fetchUser };
};
