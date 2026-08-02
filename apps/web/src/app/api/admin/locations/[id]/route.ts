import { NextRequest, NextResponse } from "next/server";
import {
  deleteStoreLocation,
  getStoreLocationById,
  updateStoreLocation,
} from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const row = await getStoreLocationById(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("[GET /api/admin/locations/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    for (const key of [
      "name",
      "slug",
      "type",
      "addressLine1",
      "addressLine2",
      "city",
      "country",
      "phone",
      "hours",
      "description",
      "mapEmbedUrl",
      "isActive",
      "sortOrder",
    ] as const) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    if (body.latitude !== undefined) {
      updateData.latitude =
        body.latitude === "" || body.latitude == null ? null : String(body.latitude);
    }
    if (body.longitude !== undefined) {
      updateData.longitude =
        body.longitude === "" || body.longitude == null ? null : String(body.longitude);
    }

    const row = await updateStoreLocation(id, updateData as never);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err: unknown) {
    console.error("[PUT /api/admin/locations/[id]]", err);
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const row = await deleteStoreLocation(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/locations/[id]]", err);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
