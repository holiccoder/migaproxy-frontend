import type { MetadataRoute } from "next";

import { ENV } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  if (ENV.ALLOW_SEARCH_ENGINE_SPIDERS) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
