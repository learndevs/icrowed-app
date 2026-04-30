import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Upsert to ensure the profile row exists
  const [profile] = await db
    .insert(profiles)
    .values({ id: user.id, email: user.email ?? "", fullName: user.user_metadata?.full_name ?? null })
    .onConflictDoUpdate({ target: profiles.id, set: { updatedAt: new Date() } })
    .returning();

  return NextResponse.json({ ...profile, email: user.email });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fullName, phone } = await req.json();

  const [updated] = await db
    .update(profiles)
    .set({
      ...(fullName !== undefined && { fullName: fullName || null }),
      ...(phone !== undefined && { phone: phone || null }),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(updated);
}
