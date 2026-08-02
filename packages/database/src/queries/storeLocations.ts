import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { storeLocations, type StoreLocationInsert } from "../schema/store_locations";

export async function getActiveStoreLocations() {
  return db
    .select()
    .from(storeLocations)
    .where(eq(storeLocations.isActive, true))
    .orderBy(asc(storeLocations.sortOrder), asc(storeLocations.city));
}

export async function getAllStoreLocations() {
  return db
    .select()
    .from(storeLocations)
    .orderBy(asc(storeLocations.sortOrder), asc(storeLocations.city));
}

export async function getStoreLocationBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(storeLocations)
    .where(and(eq(storeLocations.slug, slug), eq(storeLocations.isActive, true)));
  return row ?? null;
}

export async function getStoreLocationById(id: string) {
  const [row] = await db.select().from(storeLocations).where(eq(storeLocations.id, id));
  return row ?? null;
}

export async function createStoreLocation(
  data: Omit<StoreLocationInsert, "id" | "createdAt" | "updatedAt">,
) {
  const [row] = await db.insert(storeLocations).values(data).returning();
  return row;
}

export async function updateStoreLocation(
  id: string,
  data: Partial<Omit<StoreLocationInsert, "id" | "createdAt">>,
) {
  const [row] = await db
    .update(storeLocations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(storeLocations.id, id))
    .returning();
  return row ?? null;
}

export async function deleteStoreLocation(id: string) {
  const [row] = await db.delete(storeLocations).where(eq(storeLocations.id, id)).returning();
  return row ?? null;
}

/** Seed default Kandy shop + Kottawa/Matara pickup if table is empty. */
export async function ensureDefaultStoreLocations() {
  const existing = await getAllStoreLocations();
  if (existing.length > 0) return existing;

  const defaults: Omit<StoreLocationInsert, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "iCrowd Kandy",
      slug: "kandy",
      type: "store",
      city: "Kandy",
      country: "Sri Lanka",
      addressLine1: "",
      hours: "Open daily — confirm hours on Google or WhatsApp",
      description:
        "Visit our Kandy shop for Apple iPhones, Anker chargers and power banks, DJI drones, earbuds and accessories. Full showroom experience with expert advice, plus island-wide delivery.",
      sortOrder: 0,
      isActive: true,
    },
    {
      name: "iCrowd Kottawa Pickup",
      slug: "kottawa",
      type: "pickup",
      city: "Kottawa",
      country: "Sri Lanka",
      addressLine1: "",
      hours: "Pickup by appointment — confirm via WhatsApp",
      description:
        "Order Anker products, earbuds, iPhones and accessories online and collect at our Kottawa pickup point. Island-wide delivery also available.",
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "iCrowd Matara Pickup",
      slug: "matara",
      type: "pickup",
      city: "Matara",
      country: "Sri Lanka",
      addressLine1: "",
      hours: "Pickup by appointment — confirm via WhatsApp",
      description:
        "Buy earbuds, Anker gear, Apple products and DJI accessories online and pick up in Matara. Fast island-wide delivery across Sri Lanka.",
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const row of defaults) {
    await createStoreLocation(row);
  }
  return getAllStoreLocations();
}
