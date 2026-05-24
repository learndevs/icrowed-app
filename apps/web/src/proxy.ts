import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Paths that need an authenticated session. Public storefront pages do NOT
// hit Supabase auth so a slow/down Supabase instance can't take the site offline.
const AUTH_PATH_PREFIXES = [
  "/admin",
  "/account",
  "/checkout",
  "/operator",
] as const;

const AUTH_API_PREFIXES = [
  "/api/admin",
  "/api/account",
  "/api/orders",
  "/api/reviews",
  "/api/addresses",
  "/api/wishlist",
  "/api/profile",
  "/api/coupons",
] as const;

function needsAuth(pathname: string): boolean {
  if (AUTH_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (AUTH_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return false;
}

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  if (!needsAuth(req.nextUrl.pathname)) {
    return res;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return res;

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    const loginUrl = new URL(`/login?next=${encodeURIComponent(nextPath)}`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Static string literal only — `String.raw` / dynamic values break Next segment-config analysis at build time.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js|map)$).*)",
  ],
};
