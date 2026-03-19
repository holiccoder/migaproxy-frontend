import type { Metadata } from "next";
import { ENV } from "@/config/env";

export type SeoPageDefinition = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  imagePath?: string;
};

const SITE_NAME = "GoProxy";
const DEFAULT_IMAGE_PATH = "/images/logo/logo.png";
const metadataBase = new URL(ENV.APP_BASE_URL);

const toAbsoluteUrl = (path: string): string => {
  return new URL(path, metadataBase).toString();
};

export const createPageMetadata = (definition: SeoPageDefinition): Metadata => {
  const canonicalUrl = toAbsoluteUrl(definition.path);
  const imageUrl = toAbsoluteUrl(definition.imagePath ?? DEFAULT_IMAGE_PATH);

  return {
    metadataBase,
    title: definition.title,
    description: definition.description,
    keywords: definition.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: definition.title,
      description: definition.description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          alt: definition.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.title,
      description: definition.description,
      images: [imageUrl],
    },
    robots: definition.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
};

export const frontendSeoPages = {
  home: {
    title: "GoProxy | Quality & Affordable Proxies | Residential & Rotating",
    description:
      "Fast Residential & Rotating Proxies with 90M+ IPs in 200+ countries. 99.96% success rate. Starting from $0.75/GB.",
    path: "/",
    keywords: ["proxies", "residential proxies", "rotating proxies", "goproxy"],
  },
  blog: {
    title: "GoProxy Blog | Proxy Guides, Trends, and Product Updates",
    description:
      "Explore proxy best practices, scraping guides, data collection workflows, and platform updates from the GoProxy team.",
    path: "/blog",
    keywords: ["proxy blog", "proxy guides", "web scraping", "data collection"],
  },
  contact: {
    title: "Contact GoProxy Support | Sales and Technical Help",
    description:
      "Contact GoProxy for business use cases, technical questions, custom plans, and account support.",
    path: "/contact",
    keywords: ["contact goproxy", "proxy support", "proxy sales"],
  },
  help: {
    title: "GoProxy Help Center | Setup, Security, and Proxy Guides",
    description:
      "Find setup guides, geo-targeting tutorials, API usage tips, and troubleshooting resources in the GoProxy Help Center.",
    path: "/help",
    keywords: ["proxy help center", "proxy documentation", "proxy setup"],
  },
  partner: {
    title: "GoProxy Partners | Integrations and Ecosystem Tools",
    description:
      "Discover anti-detect browsers and partner tools that integrate with GoProxy for multi-account and automation workflows.",
    path: "/partner",
    keywords: ["proxy partners", "anti detect browser", "proxy integrations"],
  },
  proxiesLocation: {
    title: "GoProxy Locations | Country and City Proxy Coverage",
    description:
      "Browse GoProxy coverage by country and city to plan geo-targeted proxy usage for your campaigns and data pipelines.",
    path: "/proxies-location",
    keywords: ["proxy locations", "geo targeting proxies", "country proxies"],
  },
  residentialPricing: {
    title: "Residential Proxy Pricing | Flexible Plans for Every Team",
    description:
      "Compare GoProxy residential proxy plans with transparent pricing, flexible traffic options, and reliable global coverage.",
    path: "/pricing/residential-proxies",
    keywords: ["residential proxy pricing", "proxy plans", "buy proxies"],
  },
  staticResidentialPricing: {
    title: "Static Residential Proxy Pricing | Dedicated IP Plans",
    description:
      "Review GoProxy static residential proxy plans with dedicated IP options for stable sessions and long-lived workloads.",
    path: "/pricing/static-residential-proxies",
    keywords: ["static residential proxies", "dedicated proxy pricing", "sticky residential proxies"],
  },
} as const satisfies Record<string, SeoPageDefinition>;
