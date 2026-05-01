import { NextRequest, NextResponse } from "next/server";
import { getApprovedReviews } from "@icrowed/database/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reviews = await getApprovedReviews(id);
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("[GET /api/products/[id]/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
