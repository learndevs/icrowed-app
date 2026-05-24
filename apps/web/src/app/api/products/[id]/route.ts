import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@icrowd/database";
import { products, categories, brands, productImages } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { updateProduct, deleteProduct, listVariantsForProduct, syncProductVariants } from "@icrowd/database/queries";
import { getSupabaseServiceRoleKey } from "@icrowd/env";
import { requireAdmin } from "@/lib/admin";

const BUCKET = "product-images";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseServiceRoleKey(),
  );
}

function storagePathFromImageUrl(url: string): string | null {
  const parts = url.split(`/storage/v1/object/public/${BUCKET}/`);
  return parts.length === 2 ? parts[1] : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        comparePrice: products.comparePrice,
        cost: products.cost,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        brandId: products.brandId,
        brandName: brands.name,
        specifications: products.specifications,
        tags: products.tags,
        weight: products.weight,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.id, id));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const variants = await listVariantsForProduct(id);
    return NextResponse.json({ ...row, variants });
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, description, shortDescription, categoryId, brandId,
      sku, price, comparePrice, cost, stock, lowStockThreshold,
      isFeatured, isActive, specifications, tags, weight, slug,
      variants: variantsBody,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined)               updateData.name = name;
    if (slug !== undefined)               updateData.slug = slug;
    if (description !== undefined)        updateData.description = description;
    if (shortDescription !== undefined)   updateData.shortDescription = shortDescription;
    if (categoryId !== undefined)         updateData.categoryId = categoryId;
    if (brandId !== undefined)            updateData.brandId = brandId;
    if (sku !== undefined)                updateData.sku = sku;
    if (price !== undefined)              updateData.price = String(price);
    if (comparePrice !== undefined)       updateData.comparePrice = comparePrice ? String(comparePrice) : null;
    if (cost !== undefined)               updateData.cost = cost ? String(cost) : null;
    if (stock !== undefined)              updateData.stock = Number(stock);
    if (lowStockThreshold !== undefined)  updateData.lowStockThreshold = Number(lowStockThreshold);
    if (isFeatured !== undefined)         updateData.isFeatured = isFeatured;
    if (isActive !== undefined)           updateData.isActive = isActive;
    if (specifications !== undefined)     updateData.specifications = specifications;
    if (tags !== undefined)               updateData.tags = tags;
    if (weight !== undefined)             updateData.weight = weight ? String(weight) : null;

    const product = await updateProduct(id, updateData as any);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (Array.isArray(variantsBody)) {
      const normalized = variantsBody.map(
        (v: {
          id?: string;
          name?: string;
          sku?: string | null;
          price?: string | number | null;
          stock?: number;
          options?: Record<string, unknown> | null;
          isActive?: boolean;
        }) => ({
          id: v.id,
          name: String(v.name ?? "").trim() || "Configuration",
          sku: v.sku ?? null,
          price:
            v.price === null || v.price === undefined || v.price === ""
              ? null
              : String(v.price),
          stock: Number(v.stock ?? 0),
          options: v.options ?? null,
          isActive: v.isActive ?? true,
        }),
      );
      await syncProductVariants(id, normalized);
    }

    const variants = await listVariantsForProduct(id);
    return NextResponse.json({ ...product, variants });
  } catch (err: any) {
    console.error("[PUT /api/products/[id]]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Slug or SKU already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const images = await db
      .select({ url: productImages.url })
      .from(productImages)
      .where(eq(productImages.productId, id));
    const storagePaths = images
      .map((img) => storagePathFromImageUrl(img.url))
      .filter((path): path is string => path != null);
    if (storagePaths.length > 0) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage.from(BUCKET).remove(storagePaths);
      if (error) console.warn("[supabase delete product images]", error.message);
    }

    const product = await deleteProduct(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
