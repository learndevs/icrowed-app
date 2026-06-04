import { NextRequest, NextResponse } from "next/server";

/** Legacy Supabase email-confirmation callback — auth is now app-managed. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const next = searchParams.get("next") ?? "/";
  return NextResponse.redirect(
    `${origin}/login?next=${encodeURIComponent(next)}&error=auth_callback_failed`,
  );
}
