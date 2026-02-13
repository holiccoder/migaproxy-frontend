import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(authToken);

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
