import { NextRequest, NextResponse } from "next/server";
import { db } from "@icrowd/database";
import { productImages } from "@icrowd/database";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { deleteProductImageFile } from "@/lib/product-images-storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, imageId } = await params;

    const [image] = await db
      .select()
      .from(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await deleteProductImageFile(image.url);

    await db
      .delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

    if (image.isPrimary) {
      const [next] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(productImages.sortOrder)
        .limit(1);
      if (next) {
        await db
          .update(productImages)
          .set({ isPrimary: true })
          .where(eq(productImages.id, next.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]/images/[imageId]]", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, imageId } = await params;
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, id));
    await db
      .update(productImages)
      .set({ isPrimary: true })
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/products/[id]/images/[imageId]]", err);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}
