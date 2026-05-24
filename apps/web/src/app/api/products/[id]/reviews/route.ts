import { NextRequest, NextResponse } from "next/server";
import { computeReviewSummary, getApprovedReviews } from "@icrowd/database/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reviews = await getApprovedReviews(id);
    const summary = computeReviewSummary(reviews);
    return NextResponse.json({ reviews, summary });
  } catch (err) {
    console.error("[GET /api/products/[id]/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
