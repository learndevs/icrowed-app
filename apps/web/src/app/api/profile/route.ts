import { NextRequest, NextResponse } from "next/server";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/require-customer";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, auth.userId))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;

  const { fullName, phone } = await req.json();

  const [updated] = await db
    .update(profiles)
    .set({
      ...(fullName !== undefined && { fullName: fullName || null }),
      ...(phone !== undefined && { phone: phone || null }),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, auth.userId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(updated);
}
