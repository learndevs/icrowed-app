import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, offers } from "@icrowd/database";
import { updateOffer, deleteOffer } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import {
  deleteAllOfferImagesForOffer,
  deleteOfferImageFile,
} from "@/lib/offer-images-storage";

function revalidateOfferPages() {
  revalidatePath("/");
  revalidatePath("/offers");
}

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

    const [existing] = await db.select().from(offers).where(eq(offers.id, id));
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextImageUrl = imageUrl ?? null;
    const offer = await updateOffer(id, {
      title,
      description: description ?? null,
      imageUrl: nextImageUrl,
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

    if (existing.imageUrl && existing.imageUrl !== nextImageUrl) {
      await deleteOfferImageFile(existing.imageUrl);
    }

    revalidateOfferPages();
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
    await deleteAllOfferImagesForOffer(id);
    revalidateOfferPages();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
