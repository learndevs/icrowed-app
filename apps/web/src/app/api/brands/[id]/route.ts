import { NextRequest, NextResponse } from "next/server";
import { getBrandById, updateBrand, deleteBrand } from "@icrowed/database/queries";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await getBrandById(id);
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch (err) {
    console.error("[GET /api/brands/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, logoUrl, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined)    updateData.name = name;
    if (slug !== undefined)    updateData.slug = slug;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const brand = await updateBrand(id, updateData as any);
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch (err: any) {
    console.error("[PUT /api/brands/[id]]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await deleteBrand(id);
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/brands/[id]]", err);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
