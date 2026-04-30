import { NextRequest, NextResponse } from "next/server";
import { getAllBrands, createBrand } from "@icrowed/database/queries";

function slugify(name: string) {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get("all") === "true";
    const result = all
      ? await getAllBrands()
      : await (await import("@icrowed/database/queries")).getBrands();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/brands]", err);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug: slugInput, logoUrl, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug =
      typeof slugInput === "string" && slugInput.trim()
        ? slugify(slugInput.trim()) || slugify(name) || `brand-${Date.now()}`
        : slugify(name) || `brand-${Date.now()}`;

    const brand = await createBrand({
      name,
      slug,
      logoUrl: logoUrl ?? null,
      isActive: isActive ?? true,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/brands]", err);
    if (err?.code === "23505") {
      return NextResponse.json({ error: "A brand with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
