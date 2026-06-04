import { NextRequest, NextResponse } from "next/server";
import { db, wishlists } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const rows = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, auth.userId));

  return NextResponse.json({ productIds: rows.map((r) => r.productId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await db
    .insert(wishlists)
    .values({ userId: auth.userId, productId })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}
