import { eq, desc } from "drizzle-orm";
import { db } from "../index";
import { siteReviews } from "../schema";

export async function getApprovedSiteReviews() {
  return db.query.siteReviews.findMany({
    where: eq(siteReviews.isApproved, true),
    orderBy: [desc(siteReviews.createdAt)],
  });
}

export async function createSiteReview(data: {
  reviewerName: string;
  rating: number;
  body: string;
  isApproved?: boolean;
}) {
  const [row] = await db
    .insert(siteReviews)
    .values({
      reviewerName: data.reviewerName.trim(),
      rating: data.rating,
      body: data.body.trim(),
      isApproved: data.isApproved ?? true,
    })
    .returning();
  return row;
}
