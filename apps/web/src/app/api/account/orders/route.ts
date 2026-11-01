import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db, orders } from "@icrowd/database";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });

  return NextResponse.json({ orders: rows });
}
