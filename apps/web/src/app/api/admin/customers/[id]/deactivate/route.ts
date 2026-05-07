import { NextRequest, NextResponse } from "next/server";
import { db, profiles } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { isActive } = (await req.json()) as { isActive?: boolean };
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive (boolean) required" }, { status: 400 });
    }

    if (id === auth.userId && !isActive) {
      return NextResponse.json(
        { error: "You cannot deactivate yourself." },
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
      .set({ isActive, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "customer",
      entityId: id,
      action: isActive ? "reactivate" : "deactivate",
      summary: `${before.email} ${isActive ? "reactivated" : "deactivated"}`,
      before: { isActive: before.isActive },
      after: { isActive: updated.isActive },
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/customers/[id]/deactivate]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
