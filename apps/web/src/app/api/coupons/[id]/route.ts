import { NextRequest, NextResponse } from "next/server";
import { db, coupons } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { code, type, value, minOrderAmount, maxUses, isActive, expiresAt } = body;

    const [updated] = await db
      .update(coupons)
      .set({
        ...(code !== undefined && { code: String(code).trim().toUpperCase() }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: String(value) }),
        minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        ...(isActive !== undefined && { isActive }),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .where(eq(coupons.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/coupons/[id]]", err);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/coupons/[id]]", err);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
