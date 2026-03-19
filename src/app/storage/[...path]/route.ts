import type { NextRequest } from "next/server";
import { proxyRequestToBackend } from "@/lib/server/backend-proxy";

type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

const getPathSegments = async (context: RouteContext): Promise<string[]> => {
  const resolvedParams = await context.params;

  return Array.isArray(resolvedParams.path) ? resolvedParams.path : [];
};

const handleProxyRequest = async (
  request: NextRequest,
  context: RouteContext,
): Promise<Response> => {
  const pathSegments = await getPathSegments(context);
  const targetPath = `/storage/${pathSegments.join("/")}`;

  return proxyRequestToBackend(request, targetPath);
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handleProxyRequest;
export const HEAD = handleProxyRequest;
