import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@icrowed/database";
import { productImages } from "@icrowed/database";
import { eq, count } from "drizzle-orm";
import { getServerEnv } from "@icrowed/env";

const BUCKET = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getSupabaseAdmin() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${id}/${Date.now()}.${ext}`;

    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[supabase upload]", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    // Determine isPrimary (first image for this product = primary)
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
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
