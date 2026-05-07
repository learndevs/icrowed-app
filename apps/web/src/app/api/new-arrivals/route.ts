import { NextResponse } from "next/server";
import { getProducts } from "@icrowed/database/queries";

export async function GET() {
  try {
    const arrivals = await getProducts({ limit: 4 });
    return NextResponse.json({
      data: arrivals.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        brand: p.brand?.name ?? null,
        category: p.category?.name ?? null,
        imageUrl: p.images?.find((img) => img.isPrimary)?.url ?? p.images?.[0]?.url ?? null,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/new-arrivals]", err);
    return NextResponse.json({ error: "Failed to fetch new arrivals" }, { status: 500 });
  }
}
