import { NextResponse } from "next/server";
import { db, orders } from "@icrowd/database";
import { eq, desc } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, auth.userId),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });

  return NextResponse.json({ orders: rows });
}
