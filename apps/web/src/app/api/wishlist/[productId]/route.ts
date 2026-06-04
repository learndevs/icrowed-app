import { NextRequest, NextResponse } from "next/server";
import { db, wishlists } from "@icrowd/database";
import { and, eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { productId } = await params;

  await db
    .delete(wishlists)
    .where(
      and(eq(wishlists.userId, auth.userId), eq(wishlists.productId, productId)),
    );

  return NextResponse.json({ success: true });
}
