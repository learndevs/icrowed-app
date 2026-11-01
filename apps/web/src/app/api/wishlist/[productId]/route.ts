import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db, wishlists } from "@icrowd/database";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await params;

  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));

  return NextResponse.json({ success: true });
}
