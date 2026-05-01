import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, addresses, profiles } from "@icrowed/database";
import { eq, desc } from "drizzle-orm";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.addresses.findMany({
    where: eq(addresses.userId, user.id),
    orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // Ensure profile exists (upsert with minimal data)
  await db.insert(profiles)
    .values({ id: user.id, email: user.email ?? "", fullName: user.user_metadata?.full_name ?? null })
    .onConflictDoNothing();

  // If new address is default, unset existing default first
  if (isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  }

  const [address] = await db.insert(addresses).values({
    userId: user.id,
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
