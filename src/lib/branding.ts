import { ENV } from "@/config/env"
import { apiGet } from "@/lib/api"

const BRANDING_SETTINGS_API_ENDPOINT = `${ENV.API_BASE_URL}/api/v1/settings/branding`
const FALLBACK_FRONTEND_LOGO_URL = "/images/logo/logo.svg"
const LOGO_CACHE_TTL_IN_MS = 60_000

type BrandingSettingsResponse = {
  data?: {
    logo_url?: string | null
  }
}

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value)

const resolveLogoUrl = (value: string): string => {
  const trimmedValue = value.trim()

  if (isAbsoluteUrl(trimmedValue)) {
    return trimmedValue
  }

  if (trimmedValue.startsWith("/")) {
    return `${ENV.API_BASE_URL}${trimmedValue}`
  }

  return `${ENV.API_BASE_URL}/${trimmedValue}`
}

let logoUrlPromise: Promise<string> | null = null
let cachedLogoUrl: string | null = null
let cachedLogoUrlAt = 0

export function getFallbackFrontendLogoUrl(): string {
  return FALLBACK_FRONTEND_LOGO_URL
}

export async function getFrontendLogoUrl(): Promise<string> {
  if (
    cachedLogoUrl !== null &&
    Date.now() - cachedLogoUrlAt < LOGO_CACHE_TTL_IN_MS
  ) {
    return cachedLogoUrl
  }

  if (!logoUrlPromise) {
    logoUrlPromise = apiGet<BrandingSettingsResponse>(BRANDING_SETTINGS_API_ENDPOINT)
      .then((response) => {
        const logoUrl = response?.data?.logo_url

        if (typeof logoUrl === "string" && logoUrl.trim().length > 0) {
          cachedLogoUrl = resolveLogoUrl(logoUrl)
          cachedLogoUrlAt = Date.now()

          return cachedLogoUrl
        }

        cachedLogoUrl = FALLBACK_FRONTEND_LOGO_URL
        cachedLogoUrlAt = Date.now()

        return FALLBACK_FRONTEND_LOGO_URL
      })
      .catch(() => {
        cachedLogoUrl = FALLBACK_FRONTEND_LOGO_URL
        cachedLogoUrlAt = Date.now()

        return FALLBACK_FRONTEND_LOGO_URL
      })
      .finally(() => {
        logoUrlPromise = null
      })
  }

  return logoUrlPromise
}
