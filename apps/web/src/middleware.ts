import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function hasSupabaseSessionCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
}

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth refresh if Supabase is not yet configured (env vars missing)
  if (!url || !key) return res;

  // Anonymous storefront traffic does not need a Supabase round-trip on every page view.
  if (!isAdminRoute && !hasSupabaseSessionCookie(req)) {
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

  // Refresh session so it stays alive
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin/* — redirect unauthenticated users to login
  if (isAdminRoute) {
    if (!user) {
      const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      const loginUrl = new URL(`/login?next=${encodeURIComponent(nextPath)}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

// Static string literal only — `String.raw` / dynamic values break Next segment-config analysis at build time.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
