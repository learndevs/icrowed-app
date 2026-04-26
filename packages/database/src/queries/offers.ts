import { eq, and, lte, gte, or, isNull } from "drizzle-orm";
import { db } from "../index";
import { offers } from "../schema";

export async function getActiveOffers() {
  const now = new Date();
  return db.query.offers.findMany({
    where: and(
      eq(offers.isActive, true),
      or(isNull(offers.startsAt), lte(offers.startsAt, now)),
      or(isNull(offers.endsAt), gte(offers.endsAt, now))
    ),
    orderBy: (o, { asc }) => [asc(o.sortOrder)],
  });
}

export async function getFeaturedOffers() {
  const now = new Date();
  return db.query.offers.findMany({
    where: and(
      eq(offers.isActive, true),
      eq(offers.isFeatured, true),
      or(isNull(offers.startsAt), lte(offers.startsAt, now)),
      or(isNull(offers.endsAt), gte(offers.endsAt, now))
    ),
    orderBy: (o, { asc }) => [asc(o.sortOrder)],
  });
}

export async function createOffer(
  data: Omit<typeof offers.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const [offer] = await db.insert(offers).values(data).returning();
  return offer;
}
