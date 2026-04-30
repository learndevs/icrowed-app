import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, addresses } from "@icrowed/database";
import { eq, and } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Unset all defaults for this user, then set the chosen one
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));

  const [updated] = await db.update(addresses)
    .set({ isDefault: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
