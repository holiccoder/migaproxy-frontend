"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const serializedQuery = searchParams.toString();
    const destination = serializedQuery
      ? `/email-verification?${serializedQuery}`
      : "/email-verification";

    router.replace(destination);
  }, [router, searchParams]);

  return <div className="px-4 py-10 text-sm text-gray-500">Redirecting to email verification...</div>;
}
