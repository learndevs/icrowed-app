import { NextRequest, NextResponse } from "next/server";
import { createSiteReview, getApprovedSiteReviews } from "@icrowd/database/queries";

export async function GET() {
  try {
    const rows = await getApprovedSiteReviews();
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        author: r.reviewerName,
        rating: r.rating,
        quote: r.body,
        createdAt: r.createdAt.toISOString(),
      })),
      {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      },
    );
  } catch (err) {
    console.error("[GET /api/site-reviews]", err);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reviewerName = typeof body.reviewerName === "string" ? body.reviewerName.trim() : "";
    const reviewBody = typeof body.body === "string" ? body.body.trim() : "";
    const rating = Number(body.rating);

    if (reviewerName.length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (reviewerName.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (reviewBody.length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }
    if (reviewBody.length > 2000) {
      return NextResponse.json({ error: "Review must be 2000 characters or less" }, { status: 400 });
    }

    const row = await createSiteReview({
      reviewerName,
      rating,
      body: reviewBody,
      isApproved: true,
    });

    return NextResponse.json(
      {
        id: row.id,
        author: row.reviewerName,
        rating: row.rating,
        quote: row.body,
        createdAt: row.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/site-reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
