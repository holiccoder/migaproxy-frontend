import type { NextConfig } from "next";
import path from "node:path";

const DEFAULT_API_BASE_URL = "http://localhost:8001";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const allowSearchEngineSpiders =
  (process.env.NEXT_PUBLIC_ALLOW_SEARCH_ENGINE_SPIDERS ?? "false").trim().toLowerCase() === "true";

const xRobotsTag = allowSearchEngineSpiders
  ? "index, follow"
  : "noindex, nofollow, noarchive, nosnippet, noimageindex";

const apiBaseUrlObject = new URL(apiBaseUrl);
const apiStorageRemotePattern = {
  protocol: apiBaseUrlObject.protocol.replace(":", "") as "http" | "https",
  hostname: apiBaseUrlObject.hostname,
  port: apiBaseUrlObject.port || undefined,
  pathname: "/storage/**",
};

const blogStorageRemotePattern = {
  protocol: "https" as const,
  hostname: "sass-starter.test",
  port: undefined,
  pathname: "/storage/**",
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [apiStorageRemotePattern, blogStorageRemotePattern],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    root: path.resolve(__dirname),
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: xRobotsTag,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
