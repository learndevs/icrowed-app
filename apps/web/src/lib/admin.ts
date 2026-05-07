import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@icrowed/database";
import { profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";

export type AdminContext = {
  userId: string;
  email: string;
  role: "admin" | "operator" | "customer";
};

/**
 * Call at the top of any admin-only API route handler.
 * Returns `{ userId, email, role }` on success, or a NextResponse (401/403) to return immediately.
 */
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select({ role: profiles.role, email: profiles.email })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id, email: profile.email, role: profile.role };
}

/**
 * Same as requireAdmin but allows admin OR operator.
 */
export async function requireStaff(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select({ role: profiles.role, email: profiles.email })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile || (profile.role !== "admin" && profile.role !== "operator")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: user.id, email: profile.email, role: profile.role };
}
