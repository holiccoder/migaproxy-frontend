import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_PATH_PREFIX = "/user";

const AUTH_PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/notifications",
  "/tickets",
  "/orders",
  "/wallet",
  "/pricing",
  "/affiliate",
  "/faq",
  "/help-center",
] as const;

const hasPathPrefix = (pathname: string, pathPrefix: string): boolean => {
  return pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);
};

const withUserPrefix = (pathname: string): string => {
  return `${USER_PATH_PREFIX}${pathname}`;
};

const removeUserPrefix = (pathname: string): string => {
  const pathWithoutPrefix = pathname.slice(USER_PATH_PREFIX.length);
  return pathWithoutPrefix.length > 0 ? pathWithoutPrefix : "/";
};

const isAuthProtectedPath = (pathname: string): boolean => {
  return AUTH_PROTECTED_PATH_PREFIXES.some((pathPrefix) =>
    hasPathPrefix(pathname, pathPrefix),
  );
};

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(authToken);

  if (pathname === "/") {
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/user/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (pathname === USER_PATH_PREFIX || pathname === `${USER_PATH_PREFIX}/`) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/user/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  const isUserPath = hasPathPrefix(pathname, USER_PATH_PREFIX);
  const normalizedPathname = isUserPath ? removeUserPrefix(pathname) : pathname;
  const isProtectedPath = isAuthProtectedPath(normalizedPathname);

  if (!isUserPath && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withUserPrefix(normalizedPathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", withUserPrefix(normalizedPathname));
    return NextResponse.redirect(redirectUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/user/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (isUserPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = normalizedPathname;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/user/:path*",
    "/dashboard/:path*",
    "/notifications/:path*",
    "/tickets/:path*",
    "/orders/:path*",
    "/wallet/:path*",
    "/pricing/:path*",
    "/affiliate/:path*",
    "/faq/:path*",
    "/help-center/:path*",
    "/login",
    "/register",
  ],
};
