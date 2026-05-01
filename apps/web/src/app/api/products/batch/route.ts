import { NextRequest, NextResponse } from "next/server";
import { db, products, productImages, brands } from "@icrowed/database";
import { and, eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") ?? "";
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      stock: products.stock,
      brandName: brands.name,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true))
    )
    .where(inArray(products.id, ids));

  const formatted = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: Number(r.price),
    comparePrice: r.comparePrice ? Number(r.comparePrice) : undefined,
    stock: r.stock,
    brand: r.brandName ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
  }));

  return NextResponse.json({ products: formatted });
}
