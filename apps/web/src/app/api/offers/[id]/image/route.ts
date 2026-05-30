import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, offers } from "@icrowd/database";
import { updateOffer } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import {
  deleteOfferImageFile,
  saveOfferImageLocal,
} from "@/lib/offer-images-storage";

function revalidateOfferPages() {
  revalidatePath("/");
  revalidatePath("/offers");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const [existing] = await db.select().from(offers).where(eq(offers.id, id));
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { publicUrl } = await saveOfferImageLocal(id, file);
    const offer = await updateOffer(id, { imageUrl: publicUrl });
    if (!offer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.imageUrl && existing.imageUrl !== publicUrl) {
      await deleteOfferImageFile(existing.imageUrl);
    }

    revalidateOfferPages();
    return NextResponse.json({ imageUrl: publicUrl });
  } catch (err) {
    console.error("[POST /api/offers/[id]/image]", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
