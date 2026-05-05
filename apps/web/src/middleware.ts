import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

async function middlewareImpl(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth refresh if Supabase is not yet configured (env vars missing)
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

  // Refresh session so it stays alive
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin/* — redirect unauthenticated users to login
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL(`/login?next=${req.nextUrl.pathname}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

// Keep both exports for compatibility with tooling that expects either named
// `middleware` (Next convention) or `default` (some edge bundlers/adapters).
export async function middleware(req: NextRequest) {
  return middlewareImpl(req);
}

export default middleware;

// Must be a static string literal (not `String.raw`…) so Next can analyze segment config at build time.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
