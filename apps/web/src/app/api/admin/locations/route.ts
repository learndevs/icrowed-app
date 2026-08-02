import { NextRequest, NextResponse } from "next/server";
import {
  createStoreLocation,
  ensureDefaultStoreLocations,
  getAllStoreLocations,
} from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    await ensureDefaultStoreLocations().catch(() => null);
    const rows = await getAllStoreLocations();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/admin/locations]", err);
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const city = String(body.city ?? "").trim();
    if (!name || !city) {
      return NextResponse.json({ error: "name and city are required" }, { status: 400 });
    }

    const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
    const slug = slugify(slugInput || city || name) || `location-${Date.now()}`;

    const row = await createStoreLocation({
      name,
      slug,
      type: body.type === "store" ? "store" : "pickup",
      addressLine1: body.addressLine1?.trim() || null,
      addressLine2: body.addressLine2?.trim() || null,
      city,
      country: body.country?.trim() || "Sri Lanka",
      phone: body.phone?.trim() || null,
      hours: body.hours?.trim() || null,
      description: body.description?.trim() || null,
      latitude: body.latitude != null && body.latitude !== "" ? String(body.latitude) : null,
      longitude: body.longitude != null && body.longitude !== "" ? String(body.longitude) : null,
      mapEmbedUrl: body.mapEmbedUrl?.trim() || null,
      isActive: body.isActive ?? true,
      sortOrder: Number(body.sortOrder ?? 0) || 0,
    });

    return NextResponse.json(row, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/locations]", err);
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
