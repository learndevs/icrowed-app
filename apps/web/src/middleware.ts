import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import { getCustomerSessionFromRequest } from "@/lib/customer-session";

function isAdminPublicPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

function isOperatorPublicPath(pathname: string): boolean {
  return false;
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const adminSession = await getAdminSessionFromRequest(req);
    if (!isAdminPublicPath(pathname) && !adminSession) {
      const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      const loginUrl = new URL(
        `/admin/login?next=${encodeURIComponent(nextPath)}`,
        req.url,
      );
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/operator")) {
    const adminSession = await getAdminSessionFromRequest(req);
    if (!isOperatorPublicPath(pathname)) {
      if (!adminSession) {
        const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
        return NextResponse.redirect(
          new URL(
            `/admin/login?next=${encodeURIComponent(nextPath)}`,
            req.url,
          ),
        );
      }
      if (
        adminSession.role !== "admin" &&
        adminSession.role !== "operator"
      ) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
    return NextResponse.next();
  }

  // Touch customer session cookie on account routes (validates signature/expiry).
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/api/account") ||
    pathname.startsWith("/api/profile") ||
    pathname.startsWith("/api/addresses") ||
    pathname.startsWith("/api/wishlist")
  ) {
    await getCustomerSessionFromRequest(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
