import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionFromRequest,
} from "@/lib/admin-session";

function hasSupabaseSessionCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
}

function isAdminPublicPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    const adminSession = await getAdminSessionFromRequest(req);
    if (!isAdminPublicPath(pathname) && !adminSession) {
      const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      const loginUrl = new URL(
        `/admin/login?next=${encodeURIComponent(nextPath)}`,
        req.url,
      );
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return res;

  if (!hasSupabaseSessionCookie(req)) {
    return res;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
