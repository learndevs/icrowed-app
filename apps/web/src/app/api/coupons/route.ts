import { NextRequest, NextResponse } from "next/server";
import { db, coupons } from "@icrowed/database";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)],
    });
    return NextResponse.json(all);
  } catch (err) {
    console.error("[GET /api/coupons]", err);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, minOrderAmount, maxUses, isActive, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "code, type and value are required" }, { status: 400 });
    }

    const [coupon] = await db
      .insert(coupons)
      .values({
        code: String(code).trim().toUpperCase(),
        type,
        value: String(value),
        minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json(coupon, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/coupons]", err);
    const msg = err instanceof Error && err.message.includes("unique")
      ? "Coupon code already exists"
      : "Failed to create coupon";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
