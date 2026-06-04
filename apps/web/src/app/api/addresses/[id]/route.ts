import { NextRequest, NextResponse } from "next/server";
import { db, addresses } from "@icrowd/database";
import { eq, and } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const {
    label, recipientName, phone,
    addressLine1, addressLine2,
    city, district, province, postalCode,
    isDefault,
  } = body;

  if (isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, auth.userId));
  }

  const [updated] = await db
    .update(addresses)
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
    .where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
