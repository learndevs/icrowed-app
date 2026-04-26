import { NextRequest, NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@icrowed/database/queries";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cat = await getCategoryById(id);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(cat);
  } catch (err) {
    console.error("[GET /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, imageUrl, parentId, isActive, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined)        updateData.name = name;
    if (slug !== undefined)        updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined)    updateData.imageUrl = imageUrl;
    if (parentId !== undefined)    updateData.parentId = parentId;
    if (isActive !== undefined)    updateData.isActive = isActive;
    if (sortOrder !== undefined)   updateData.sortOrder = sortOrder;

    const category = await updateCategory(id, updateData as any);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err: any) {
    console.error("[PUT /api/categories/[id]]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await deleteCategory(id);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
