import { NextRequest, NextResponse } from "next/server";
import { db, products, productImages, brands, productVariants } from "@icrowed/database";
import { and, eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawProductIds = searchParams.get("ids") ?? "";
  const productIds = rawProductIds.split(",").map((s) => s.trim()).filter(Boolean);
  const rawVariantIds = searchParams.get("variantIds") ?? "";
  const variantIds = rawVariantIds.split(",").map((s) => s.trim()).filter(Boolean);

  if (productIds.length === 0 && variantIds.length === 0) {
    return NextResponse.json({ products: [], variants: [] });
  }

  const rows =
    productIds.length > 0
      ? await db
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
          .where(inArray(products.id, productIds))
      : [];

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

  const variantRows =
    variantIds.length > 0
      ? await db
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            stock: productVariants.stock,
          })
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds))
      : [];

  return NextResponse.json({ products: formatted, variants: variantRows });
}
