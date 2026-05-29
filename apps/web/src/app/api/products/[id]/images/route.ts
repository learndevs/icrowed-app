import { NextRequest, NextResponse } from "next/server";
import { db } from "@icrowd/database";
import { productImages } from "@icrowd/database";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import {
  saveProductImageLocal,
  validateProductImageUpload,
} from "@/lib/product-images-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.sortOrder);
    return NextResponse.json(images);
  } catch (err) {
    console.error("[GET /api/products/[id]/images]", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateProductImageUpload(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { publicUrl } = await saveProductImageLocal(id, file);

    const [{ total }] = await db
      .select({ total: count() })
      .from(productImages)
      .where(eq(productImages.productId, id));
    const isPrimary = total === 0;

    const [image] = await db
      .insert(productImages)
      .values({
        productId: id,
        url: publicUrl,
        altText: file.name.replace(/\.[^.]+$/, ""),
        isPrimary,
        sortOrder: total,
      })
      .returning();

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products/[id]/images]", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
