import { NextRequest, NextResponse } from "next/server";
import { updateOffer, deleteOffer } from "@icrowed/database/queries";
import { requireAdmin } from "@/lib/admin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, description, imageUrl, linkUrl, badgeText, discountPercent, isActive, isFeatured, startsAt, endsAt, sortOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const offer = await updateOffer(id, {
      title,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      linkUrl: linkUrl ?? null,
      badgeText: badgeText ?? null,
      discountPercent: discountPercent ?? null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      sortOrder: sortOrder ?? 0,
    });

    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(offer);
  } catch (err) {
    console.error("[PUT /api/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const offer = await deleteOffer(id);
    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(offer);
  } catch (err) {
    console.error("[DELETE /api/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
