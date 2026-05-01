import { eq, and, desc } from "drizzle-orm";
import { db } from "../index";
import { reviews } from "../schema";

export async function getApprovedReviews(productId: string) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), eq(reviews.isApproved, true)),
    orderBy: [desc(reviews.createdAt)],
    with: { user: { columns: { id: true, fullName: true } } },
  });
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
