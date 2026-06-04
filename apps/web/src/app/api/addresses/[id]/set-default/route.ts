import { NextRequest, NextResponse } from "next/server";
import { db, addresses } from "@icrowd/database";
import { eq, and } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, auth.userId));

  const [updated] = await db
    .update(addresses)
    .set({ isDefault: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
