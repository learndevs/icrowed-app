import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, wishlists, products } from "@icrowed/database";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, user.id));

  return NextResponse.json({ productIds: rows.map((r) => r.productId) });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await db
    .insert(wishlists)
    .values({ userId: user.id, productId })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}
