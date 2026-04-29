import { NextRequest, NextResponse } from "next/server";
import { approveReview, deleteReview } from "@icrowed/database/queries";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const review = await approveReview(id);
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(review);
  } catch (err) {
    console.error("[PATCH /api/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to approve review" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const review = await deleteReview(id);
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
