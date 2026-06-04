import { NextRequest, NextResponse } from "next/server";
import { db, addresses } from "@icrowd/database";
import { eq, desc } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const rows = await db.query.addresses.findMany({
    where: eq(addresses.userId, auth.userId),
    orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const {
    label, recipientName, phone,
    addressLine1, addressLine2,
    city, district, province, postalCode,
    isDefault = false,
  } = body;

  if (!recipientName || !phone || !addressLine1 || !city || !district) {
    return NextResponse.json({ error: "recipientName, phone, addressLine1, city and district are required" }, { status: 400 });
  }

  if (isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, auth.userId));
  }

  const [address] = await db.insert(addresses).values({
    userId: auth.userId,
    label: label || "Home",
    recipientName,
    phone,
    addressLine1,
    addressLine2: addressLine2 || null,
    city,
    district,
    province: province || null,
    postalCode: postalCode || null,
    isDefault,
  }).returning();

  return NextResponse.json(address, { status: 201 });
}
