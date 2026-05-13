import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const meta = user.user_metadata ?? {};

      const existing = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.id, user.id));

      if (existing.length === 0) {
        await db.insert(profiles).values({
          id: user.id,
          email: user.email!,
          fullName: (meta.full_name as string | undefined) ?? null,
          phone: (meta.phone as string | undefined) ?? null,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
