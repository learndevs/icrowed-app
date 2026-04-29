import { NextRequest, NextResponse } from "next/server";
import { getAllOffers, getActiveOffers, createOffer } from "@icrowed/database/queries";

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    const result = all ? await getAllOffers() : await getActiveOffers();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/offers]", err);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, linkUrl, badgeText, discountPercent, isActive, isFeatured, startsAt, endsAt, sortOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const offer = await createOffer({
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

    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    console.error("[POST /api/offers]", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
