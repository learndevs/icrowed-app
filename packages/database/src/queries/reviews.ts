import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "../index";
import { reviews } from "../schema";

export function computeReviewSummary(rows: { rating: number }[]) {
  const reviewCount = rows.length;
  const rating = reviewCount
    ? Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / reviewCount) * 10) / 10
    : 0;

  return { reviewCount, rating };
}

export async function getApprovedReviews(productId: string) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), eq(reviews.isApproved, true)),
    orderBy: [desc(reviews.createdAt)],
    with: { user: { columns: { id: true, fullName: true } } },
  });
}

export async function getProductReviewSummary(productId: string) {
  const rows = await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), eq(reviews.isApproved, true)),
    columns: { rating: true },
  });

  return computeReviewSummary(rows);
}

export async function getReviewSummariesForProducts(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, { rating: number; reviewCount: number }>();
  }

  const rows = await db
    .select({
      productId: reviews.productId,
      rating: reviews.rating,
    })
    .from(reviews)
    .where(and(inArray(reviews.productId, productIds), eq(reviews.isApproved, true)));

  const grouped = new Map<string, { rating: number }[]>();
  for (const row of rows) {
    const list = grouped.get(row.productId) ?? [];
    list.push({ rating: row.rating });
    grouped.set(row.productId, list);
  }

  const summaries = new Map<string, { rating: number; reviewCount: number }>();
  for (const productId of productIds) {
    summaries.set(productId, computeReviewSummary(grouped.get(productId) ?? []));
  }

  return summaries;
}

export async function getAllReviews() {
  return db.query.reviews.findMany({
    orderBy: [desc(reviews.createdAt)],
    with: {
      product: { columns: { id: true, name: true } },
      user: { columns: { id: true, fullName: true } },
    },
  });
}

export async function getPendingReviews() {
  return db.query.reviews.findMany({
    where: eq(reviews.isApproved, false),
    orderBy: [desc(reviews.createdAt)],
    with: {
      product: { columns: { id: true, name: true } },
      user: { columns: { id: true, fullName: true } },
    },
  });
}

export async function createReview(
  data: Omit<typeof reviews.$inferInsert, "id" | "createdAt">
) {
  const [review] = await db.insert(reviews).values(data).returning();
  return review;
}

export async function approveReview(id: string) {
  const [review] = await db
    .update(reviews)
    .set({ isApproved: true })
    .where(eq(reviews.id, id))
    .returning();
  return review;
}

export async function deleteReview(id: string) {
  const [review] = await db
    .delete(reviews)
    .where(eq(reviews.id, id))
    .returning();
  return review;
}
