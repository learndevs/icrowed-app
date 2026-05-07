import { NextRequest, NextResponse } from "next/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { email, fullName, role } = (await req.json()) as {
      email?: string;
      fullName?: string;
      role?: "admin" | "operator";
    };
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (role !== "admin" && role !== "operator") {
      return NextResponse.json(
        { error: "role must be admin or operator" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback?next=/admin`;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { fullName },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const newUser = data.user;
    if (!newUser) {
      return NextResponse.json(
        { error: "Invite returned no user" },
        { status: 500 }
      );
    }

    // Ensure profile row exists with the correct role.
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, newUser.id));
    let profile;
    if (existing) {
      [profile] = await db
        .update(profiles)
        .set({
          role,
          fullName: fullName ?? existing.fullName,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, newUser.id))
        .returning();
    } else {
      [profile] = await db
        .insert(profiles)
        .values({
          id: newUser.id,
          email,
          fullName: fullName ?? null,
          role,
        })
        .returning();
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "admin",
      entityId: newUser.id,
      action: "create",
      summary: `Invited ${email} as ${role}`,
      metadata: { role, email },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("[POST /api/admin/admins/invite]", err);
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
