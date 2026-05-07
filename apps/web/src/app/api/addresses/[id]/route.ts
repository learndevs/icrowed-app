import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, addresses } from "@icrowed/database";
import { eq, and } from "drizzle-orm";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    label, recipientName, phone,
    addressLine1, addressLine2,
    city, district, province, postalCode,
    isDefault,
  } = body;

  // If setting as default, clear other defaults first
  if (isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  }

  const [updated] = await db.update(addresses)
    .set({
      ...(label !== undefined && { label }),
      ...(recipientName !== undefined && { recipientName }),
      ...(phone !== undefined && { phone }),
      ...(addressLine1 !== undefined && { addressLine1 }),
      addressLine2: addressLine2 ?? null,
      ...(city !== undefined && { city }),
      ...(district !== undefined && { district }),
      province: province ?? null,
      postalCode: postalCode ?? null,
      ...(isDefault !== undefined && { isDefault }),
    })
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  return NextResponse.json({ success: true });
}
