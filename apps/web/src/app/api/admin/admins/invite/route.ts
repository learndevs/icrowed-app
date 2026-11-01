import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";
import { db, profiles, authAccounts } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authz = await requireAdmin();
  if (authz instanceof NextResponse) return authz;

  try {
    const { email: rawEmail, fullName, role } = (await req.json()) as {
      email?: string;
      fullName?: string;
      role?: "admin" | "operator";
    };
    const email = rawEmail?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (role !== "admin" && role !== "operator") {
      return NextResponse.json(
        { error: "role must be admin or operator" },
        { status: 400 },
      );
    }

    const [existing] = await db.select().from(profiles).where(eq(profiles.email, email));

    let profile;
    if (existing) {
      [profile] = await db
        .update(profiles)
        .set({
          role,
          fullName: fullName ?? existing.fullName,
          emailVerified: true,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, existing.id))
        .returning();
    } else {
      [profile] = await db
        .insert(profiles)
        .values({ email, fullName: fullName ?? null, role, emailVerified: true })
        .returning();
    }

    // Give the account a credential with an unguessable password; the invitee sets
    // their own through the reset link emailed below.
    const [credential] = await db
      .select({ id: authAccounts.id })
      .from(authAccounts)
      .where(eq(authAccounts.userId, profile.id));
    if (!credential) {
      await db.insert(authAccounts).values({
        userId: profile.id,
        accountId: profile.id,
        providerId: "credential",
        password: await hashPassword(crypto.randomBytes(32).toString("hex")),
      });
    }

    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
    });

    await logAudit({
      actor: { userId: authz.userId, email: authz.email },
      entityType: "admin",
      entityId: profile.id,
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
