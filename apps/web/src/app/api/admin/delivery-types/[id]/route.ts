import { NextRequest, NextResponse } from "next/server";
import {
  deleteDeliveryType,
  getDeliveryTypeById,
  updateDeliveryType,
} from "@icrowd/database";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

function serializeType(row: NonNullable<Awaited<ReturnType<typeof getDeliveryTypeById>>>) {
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

export async function PUT(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;

  try {
    const before = await getDeliveryTypeById(id);
    if (!before) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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

    if (priceLkr !== undefined && priceLkr < 0) {
      return NextResponse.json({ error: "priceLkr must be non-negative" }, { status: 400 });
    }

    const row = await updateDeliveryType(id, {
      name,
      slug,
      description,
      priceLkr,
      eligibleForFreeShipping,
      sortOrder,
      isActive,
    });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "delivery_type",
      entityId: id,
      action: "update",
      summary: `Delivery type updated: ${row.name}`,
      before: serializeType(before),
      after: serializeType(row),
    });

    return NextResponse.json(serializeType(row));
  } catch (err) {
    console.error("admin delivery-types PUT:", err);
    const message = err instanceof Error ? err.message : "Failed to update delivery type";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;

  try {
    const before = await getDeliveryTypeById(id);
    if (!before) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = await deleteDeliveryType(id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "delivery_type",
      entityId: id,
      action: "delete",
      summary: `Delivery type deactivated: ${row.name}`,
      before: serializeType(before),
      after: serializeType(row),
    });

    return NextResponse.json(serializeType(row));
  } catch (err) {
    console.error("admin delivery-types DELETE:", err);
    return NextResponse.json({ error: "Failed to delete delivery type" }, { status: 500 });
  }
}
