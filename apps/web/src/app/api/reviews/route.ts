import { NextRequest, NextResponse } from "next/server";
import { createReview, getAllReviews, getPendingReviews, hasUserPurchasedProduct } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import { notifyAdmins } from "@/lib/notify";
import { getCustomerFromSession } from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const pending = req.nextUrl.searchParams.get("filter") === "pending";
    const result = pending ? await getPendingReviews() : await getAllReviews();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, title, body: reviewBody, reviewerName } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
    }

    const name = typeof reviewerName === "string" ? reviewerName.trim() : "";
    if (name.length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
    }

    let userId: string | null = null;
    let isVerifiedPurchase = false;

    const customer = await getCustomerFromSession();
    if (customer) {
      userId = customer.userId;
      isVerifiedPurchase = await hasUserPurchasedProduct(customer.userId, productId);
    }

    const review = await createReview({
      productId,
      userId,
      reviewerName: name,
      rating: Number(rating),
      title: title?.trim() || null,
      body: reviewBody?.trim() || null,
      isVerifiedPurchase,
      isApproved: true,
    });

    notifyAdmins("review_pending", {
      subject: `New review submitted (rating: ${rating})`,
      html: `<p>A new product review has been submitted and is awaiting approval.</p>
        <p><strong>Reviewer:</strong> ${name}<br/>
        <strong>Rating:</strong> ${rating} / 5<br/>
        <strong>Title:</strong> ${title ?? "—"}</p>
        <p>${reviewBody ?? ""}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/reviews">Moderate reviews</a></p>`,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
