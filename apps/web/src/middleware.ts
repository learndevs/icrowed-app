import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

function isAdminPublicPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

/**
 * Fast cookie-presence gate only. The real session + role check happens in
 * the admin layout and in requireAdmin()/requireStaff() for API routes.
 */
export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin") && !isAdminPublicPath(pathname)) {
    if (!getSessionCookie(req)) {
      const loginUrl = new URL(
        `/admin/login?next=${encodeURIComponent(`${pathname}${search}`)}`,
        req.url,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/account") && !getSessionCookie(req)) {
    const loginUrl = new URL(
      `/login?next=${encodeURIComponent(`${pathname}${search}`)}`,
      req.url,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
