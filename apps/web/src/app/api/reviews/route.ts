import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createReview, getAllReviews, getPendingReviews, hasUserPurchasedProduct } from "@icrowed/database/queries";
import { clientEnv } from "@icrowed/env";
import { requireAdmin } from "@/lib/admin";
import { notifyAdmins } from "@/lib/notify";

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
    const cookieStore = await cookies();
    const supabase = createServerClient(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to write a review" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, body: reviewBody } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
    }

    const isVerifiedPurchase = await hasUserPurchasedProduct(user.id, productId);

    const review = await createReview({
      productId,
      userId: user.id,
      rating: Number(rating),
      title: title?.trim() || null,
      body: reviewBody?.trim() || null,
      isVerifiedPurchase,
      isApproved: false,
    });

    notifyAdmins("review_pending", {
      subject: `New review submitted (rating: ${rating})`,
      html: `<p>A new product review has been submitted and is awaiting approval.</p>
        <p><strong>Rating:</strong> ${rating} / 5<br/>
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
