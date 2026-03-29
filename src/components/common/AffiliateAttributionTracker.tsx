"use client";

import {
  AFFILIATE_QUERY_PARAM,
  getStoredAffiliateCode,
  hasTrackedAffiliateClickInSession,
  markAffiliateClickTrackedInSession,
  normalizeAffiliateCode,
  setStoredAffiliateCode,
} from "@/lib/affiliate-attribution";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AFFILIATE_TRACK_ENDPOINT = "/api/v1/affiliate/track";

const shouldMarkTrackingSession = (statusCode: number): boolean => {
  return statusCode < 500;
};

export default function AffiliateAttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedSearchParams = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(serializedSearchParams);
    const affiliateCodeFromQuery = normalizeAffiliateCode(
      params.get(AFFILIATE_QUERY_PARAM),
    );

    if (!affiliateCodeFromQuery) {
      getStoredAffiliateCode();
      return;
    }

    setStoredAffiliateCode(affiliateCodeFromQuery);

    if (hasTrackedAffiliateClickInSession(affiliateCodeFromQuery)) {
      return;
    }

    let isCancelled = false;

    const trackAffiliateClick = async (): Promise<void> => {
      const trackingQuery = new URLSearchParams({
        code: affiliateCodeFromQuery,
      });

      try {
        const response = await fetch(
          `${AFFILIATE_TRACK_ENDPOINT}?${trackingQuery.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!isCancelled && shouldMarkTrackingSession(response.status)) {
          markAffiliateClickTrackedInSession(affiliateCodeFromQuery);
        }
      } catch {
        // keep referral attribution resilient to temporary network failures
      }
    };

    void trackAffiliateClick();

    return () => {
      isCancelled = true;
    };
  }, [pathname, serializedSearchParams]);

  return null;
}
