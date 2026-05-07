import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, orders } from "@icrowed/database";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });

  return NextResponse.json({ orders: rows });
}
