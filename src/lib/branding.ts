import { toRelativeApiUrl } from "@/config/env"
import { apiGet } from "@/lib/api"

const BRANDING_SETTINGS_API_ENDPOINT = "/api/v1/settings/branding"
const FALLBACK_FRONTEND_LOGO_URL = "/images/logo/logo.svg"
const FALLBACK_FRONTEND_FAVICON_URL = "/favicon.ico"
const BRANDING_SETTINGS_CACHE_TTL_IN_MS = 60_000

type BrandingSettingsResponse = {
  data?: {
    logo_url?: string | null
    favicon_url?: string | null
  }
}

type BrandingAssets = {
  logoUrl: string
  faviconUrl: string
}

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value)

const resolveAssetUrl = (value: string): string => {
  const trimmedValue = value.trim()

  if (isAbsoluteUrl(trimmedValue)) {
    return toRelativeApiUrl(trimmedValue)
  }

  if (trimmedValue.startsWith("/")) {
    return trimmedValue
  }

  return `/${trimmedValue.replace(/^\/+/, "")}`
}

const getFallbackBrandingAssets = (): BrandingAssets => ({
  logoUrl: FALLBACK_FRONTEND_LOGO_URL,
  faviconUrl: FALLBACK_FRONTEND_FAVICON_URL,
})

let brandingAssetsPromise: Promise<BrandingAssets> | null = null
let cachedBrandingAssets: BrandingAssets | null = null
let cachedBrandingAssetsAt = 0

export function getFallbackFrontendLogoUrl(): string {
  return FALLBACK_FRONTEND_LOGO_URL
}

export function getFallbackFrontendFaviconUrl(): string {
  return FALLBACK_FRONTEND_FAVICON_URL
}

async function getFrontendBrandingAssets(): Promise<BrandingAssets> {
  if (
    cachedBrandingAssets !== null &&
    Date.now() - cachedBrandingAssetsAt < BRANDING_SETTINGS_CACHE_TTL_IN_MS
  ) {
    return cachedBrandingAssets
  }

  if (!brandingAssetsPromise) {
    brandingAssetsPromise = apiGet<BrandingSettingsResponse>(BRANDING_SETTINGS_API_ENDPOINT)
      .then((response) => {
        const logoUrl = response?.data?.logo_url
        const faviconUrl = response?.data?.favicon_url

        const resolvedLogoUrl =
          typeof logoUrl === "string" && logoUrl.trim().length > 0
            ? resolveAssetUrl(logoUrl)
            : FALLBACK_FRONTEND_LOGO_URL
        const resolvedFaviconUrl =
          typeof faviconUrl === "string" && faviconUrl.trim().length > 0
            ? resolveAssetUrl(faviconUrl)
            : FALLBACK_FRONTEND_FAVICON_URL

        cachedBrandingAssets = {
          logoUrl: resolvedLogoUrl,
          faviconUrl: resolvedFaviconUrl,
        }
        cachedBrandingAssetsAt = Date.now()

        return cachedBrandingAssets
      })
      .catch(() => {
        cachedBrandingAssets = getFallbackBrandingAssets()
        cachedBrandingAssetsAt = Date.now()

        return cachedBrandingAssets
      })
      .finally(() => {
        brandingAssetsPromise = null
      })
  }

  return brandingAssetsPromise
}

export async function getFrontendLogoUrl(): Promise<string> {
  const brandingAssets = await getFrontendBrandingAssets()

  return brandingAssets.logoUrl
}

export async function getFrontendFaviconUrl(): Promise<string> {
  const brandingAssets = await getFrontendBrandingAssets()

  return brandingAssets.faviconUrl
}
