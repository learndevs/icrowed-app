import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createReview, getAllReviews, getPendingReviews } from "@icrowed/database/queries";
import { clientEnv } from "@icrowed/env";

export async function GET(req: NextRequest) {
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

    const body = await req.json();
    const { productId, rating, title, body: reviewBody } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
    }

    const review = await createReview({
      productId,
      userId: user?.id ?? null,
      rating: Number(rating),
      title: title?.trim() || null,
      body: reviewBody?.trim() || null,
      isVerifiedPurchase: false,
      isApproved: false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
