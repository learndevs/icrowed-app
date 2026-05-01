import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, wishlists } from "@icrowed/database";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await params;

  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));

  return NextResponse.json({ success: true });
}
