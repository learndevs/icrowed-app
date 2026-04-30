import { NextRequest, NextResponse } from "next/server";
import { db, coupons } from "@icrowed/database";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "code and subtotal are required" }, { status: 400 });
    }

    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.trim().toUpperCase()),
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Coupon code not found" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" });
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount is LKR ${Number(coupon.minOrderAmount).toLocaleString()}`,
      });
    }

    const discount =
      coupon.type === "percent"
        ? Math.round((subtotal * Number(coupon.value)) / 100)
        : Math.min(Number(coupon.value), subtotal);

    return NextResponse.json({
      valid: true,
      discount,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      message: `Coupon applied — ${coupon.type === "percent" ? `${coupon.value}% off` : `LKR ${Number(coupon.value).toLocaleString()} off`}`,
    });
  } catch (err) {
    console.error("[POST /api/coupons/validate]", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
