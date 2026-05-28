import { NextRequest, NextResponse } from "next/server";
import { getProductsAdmin, createProduct, syncProductVariants } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";

function slugify(name: string) {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam === null ? undefined : isActiveParam === "true";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const { rows, total } = await getProductsAdmin({ search, categoryId, isActive, limit, offset });
    return NextResponse.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      name, description, shortDescription, warranty, categoryId, brandId,
      sku, price, comparePrice, cost, stock, lowStockThreshold,
      isFeatured, isActive, specifications, tags, weight,
      variants: variantsBody,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "name and price are required" }, { status: 400 });
    }

    const baseSlug = slugify(name);

    const product = await createProduct({
      name,
      slug: baseSlug || `product-${Date.now()}`,
      description: description ?? null,
      shortDescription: shortDescription ?? null,
      warranty: warranty ?? null,
      categoryId: categoryId ?? null,
      brandId: brandId ?? null,
      sku: sku ?? null,
      price: String(price),
      comparePrice: comparePrice ? String(comparePrice) : null,
      cost: cost ? String(cost) : null,
      stock: stock ?? 0,
      lowStockThreshold: lowStockThreshold ?? 5,
      isFeatured: isFeatured ?? false,
      isActive: isActive ?? true,
      specifications: specifications ?? null,
      tags: tags ?? [],
      weight: weight ? String(weight) : null,
    });

    if (Array.isArray(variantsBody) && variantsBody.length > 0) {
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
      await syncProductVariants(product.id, normalized);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/products]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "A product with that slug or SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
