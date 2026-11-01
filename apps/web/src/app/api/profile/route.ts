import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fullName, phone } = await req.json();

  const [updated] = await db
    .update(profiles)
    .set({
      ...(fullName !== undefined && { fullName: fullName || null }),
      ...(phone !== undefined && { phone: phone || null }),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(updated);
}
