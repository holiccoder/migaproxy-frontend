import "server-only";
import type { NextRequest } from "next/server";

const DEFAULT_API_PROXY_URL = "http://127.0.0.1:8001";
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

let hasEnabledInsecureTlsForLocalDev = false;

const backendBaseUrl = (
  process.env.API_PROXY_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_PROXY_URL
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const normalizeTargetPath = (targetPath: string): string => {
  return targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
};

const hasRequestBody = (method: string): boolean => {
  const normalizedMethod = method.toUpperCase();
  return normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
};

const cloneHeadersWithout = (headers: Headers, blockedHeaders: Set<string>): Headers => {
  const nextHeaders = new Headers();

  headers.forEach((value, key) => {
    if (blockedHeaders.has(key.toLowerCase())) {
      return;
    }

    nextHeaders.set(key, value);
  });

  return nextHeaders;
};

const shouldUseInsecureTlsFallback = (url: string): boolean => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".test");
  } catch {
    return false;
  }
};

const getTargetUrl = (request: NextRequest, targetPath: string): string => {
  const targetUrl = new URL(`${backendBaseUrl}${normalizeTargetPath(targetPath)}`);
  targetUrl.search = request.nextUrl.search;

  return targetUrl.toString();
};

const createProxyErrorResponse = (): Response => {
  return new Response(
    JSON.stringify({
      message: "Unable to reach backend service.",
    }),
    {
      status: 502,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

export async function proxyRequestToBackend(request: NextRequest, targetPath: string): Promise<Response> {
  const targetUrl = getTargetUrl(request, targetPath);
  const blockedRequestHeaders = new Set([...HOP_BY_HOP_HEADERS, "host", "content-length"]);
  const requestHeaders = cloneHeadersWithout(request.headers, blockedRequestHeaders);
  const requestInit: RequestInit = {
    method: request.method,
    headers: requestHeaders,
    redirect: "manual",
    cache: "no-store",
  };

  if (hasRequestBody(request.method) && request.body) {
    requestInit.body = request.body;
    (requestInit as RequestInit & { duplex: "half" }).duplex = "half";
  }

  const sendRequest = async (): Promise<Response> => {
    return fetch(targetUrl, requestInit);
  };

  let upstreamResponse: Response;

  try {
    upstreamResponse = await sendRequest();
  } catch {
    if (!shouldUseInsecureTlsFallback(targetUrl)) {
      return createProxyErrorResponse();
    }

    if (!hasEnabledInsecureTlsForLocalDev) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      hasEnabledInsecureTlsForLocalDev = true;
    }

    try {
      upstreamResponse = await sendRequest();
    } catch {
      return createProxyErrorResponse();
    }
  }

  const responseHeaders = cloneHeadersWithout(upstreamResponse.headers, HOP_BY_HOP_HEADERS);
  responseHeaders.delete("host");
  responseHeaders.delete("content-length");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
