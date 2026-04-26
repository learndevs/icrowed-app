import { NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  createCategory,
} from "@icrowed/database/queries";

function slugify(name: string) {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get("all") === "true";
    const cats = all
      ? await getAllCategories()
      : await (await import("@icrowed/database/queries")).getCategories();
    return NextResponse.json(cats);
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, imageUrl, parentId, isActive, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const category = await createCategory({
      name,
      slug: slugify(name) || `category-${Date.now()}`,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      parentId: parentId ?? null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/categories]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
