import { NextRequest, NextResponse } from "next/server";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { deleteUserById } from "@/lib/delete-user";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    if (id === auth.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 },
      );
    }

    const [target] = await db
      .select({ role: profiles.role, email: profiles.email })
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be deleted here. Demote the user first or use staff management." },
        { status: 400 },
      );
    }

    const result = await deleteUserById(id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "customer",
      entityId: id,
      action: "delete",
      summary: `Deleted ${result.email} (${result.role})`,
      before: { email: result.email, role: result.role },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/customers/[id]]", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
