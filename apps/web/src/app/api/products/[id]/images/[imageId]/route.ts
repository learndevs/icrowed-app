import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@icrowed/database";
import { productImages } from "@icrowed/database";
import { eq, and } from "drizzle-orm";
import { getServerEnv } from "@icrowed/env";

const BUCKET = "product-images";

function getSupabaseAdmin() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;

    const [image] = await db
      .select()
      .from(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Extract storage path from public URL
    // URL pattern: .../storage/v1/object/public/{bucket}/{path}
    const urlParts = image.url.split(`/storage/v1/object/public/${BUCKET}/`);
    if (urlParts.length === 2) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage.from(BUCKET).remove([urlParts[1]]);
      if (error) {
        console.warn("[supabase delete]", error.message);
        // Non-fatal — still remove DB record
      }
    }

    await db
      .delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

    // If deleted image was primary, promote the next one
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
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  // Set an image as primary
  try {
    const { id, imageId } = await params;
    // Unset all primary for this product, then set the selected one
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
