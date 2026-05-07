import { NextRequest, NextResponse } from "next/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

const ALLOWED = ["customer", "operator", "admin"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { role } = (await req.json()) as { role?: string };
    if (!role || !ALLOWED.includes(role as (typeof ALLOWED)[number])) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (id === auth.userId && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot demote yourself." },
        { status: 400 }
      );
    }

    const [before] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    if (!before) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(profiles)
      .set({ role: role as (typeof ALLOWED)[number], updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "customer",
      entityId: id,
      action: "role_change",
      summary: `${before.email}: ${before.role} → ${role}`,
      before: { role: before.role },
      after: { role: updated.role },
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/customers/[id]/role]", err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
