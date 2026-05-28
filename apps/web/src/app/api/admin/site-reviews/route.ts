import { NextResponse } from "next/server";
import { getAllSiteReviews } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const rows = await getAllSiteReviews();
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        rating: r.rating,
        body: r.body,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("[GET /api/admin/site-reviews]", err);
    return NextResponse.json({ error: "Failed to load site reviews" }, { status: 500 });
  }
}
