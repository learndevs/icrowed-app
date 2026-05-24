import { NextRequest, NextResponse } from "next/server";
import { createDeliveryType, getAllDeliveryTypes } from "@icrowd/database";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

function serializeType(row: Awaited<ReturnType<typeof getAllDeliveryTypes>>[number]) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceLkr: Number(row.priceLkr),
    eligibleForFreeShipping: row.eligibleForFreeShipping,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const types = await getAllDeliveryTypes();
    return NextResponse.json(types.map(serializeType));
  } catch (err) {
    console.error("admin delivery-types GET:", err);
    return NextResponse.json({ error: "Failed to load delivery types" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { name, slug, description, priceLkr, eligibleForFreeShipping, sortOrder, isActive } =
      body as {
        name?: string;
        slug?: string;
        description?: string | null;
        priceLkr?: number;
        eligibleForFreeShipping?: boolean;
        sortOrder?: number;
        isActive?: boolean;
      };

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (priceLkr === undefined || priceLkr < 0) {
      return NextResponse.json({ error: "priceLkr must be a non-negative number" }, { status: 400 });
    }

    const row = await createDeliveryType({
      name,
      slug,
      description,
      priceLkr,
      eligibleForFreeShipping,
      sortOrder,
      isActive,
    });

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "delivery_type",
      action: "create",
      summary: `Delivery type created: ${row.name}`,
      after: serializeType(row),
    });

    return NextResponse.json(serializeType(row), { status: 201 });
  } catch (err) {
    console.error("admin delivery-types POST:", err);
    const message = err instanceof Error ? err.message : "Failed to create delivery type";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
