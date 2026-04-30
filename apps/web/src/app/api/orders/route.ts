import { NextRequest, NextResponse } from "next/server";
import {
  db,
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productVariants,
  getOrCreateShippingRates,
  computeShippingLkr,
} from "@icrowed/database";
import { and, eq, gte, sql } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const status = searchParams.get("status");

  if (orderNumber) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: { items: true, statusHistory: true, user: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  }

  const allOrders = await db.query.orders.findMany({
    where: status ? eq(orders.status, status as typeof orders.$inferSelect["status"]) : undefined,
    with: { items: true },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    limit: 50,
  });
  return NextResponse.json(allOrders);
}

type IncomingLine = {
  productId?: string;
  variantId?: string;
  productName?: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice?: number;
  imageUrl?: string;
};

type ResolvedLine = {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingDistrict,
      shippingProvince,
      shippingPostalCode,
      items,
      paymentMethod,
      delivery,
      discount = 0,
      customerNote,
      bankTransferReference,
      bankTransferPayerName,
      bankTransferProofUrl,
    } = body;

    if (!delivery || (delivery !== "standard" && delivery !== "express")) {
      return NextResponse.json(
        { error: "delivery must be 'standard' or 'express'" },
        { status: 400 }
      );
    }

    if (!items?.length) {
      return NextResponse.json({ error: "items are required" }, { status: 400 });
    }

    if (paymentMethod === "bank_transfer") {
      const ref = typeof bankTransferReference === "string" ? bankTransferReference.trim() : "";
      if (!ref) {
        return NextResponse.json(
          { error: "bankTransferReference is required for bank transfer" },
          { status: 400 }
        );
      }
    }

    const resolved: ResolvedLine[] = [];

    for (const raw of items as IncomingLine[]) {
      const qty = Number(raw.quantity);
      if (!raw.productId || !Number.isFinite(qty) || qty < 1) {
        return NextResponse.json(
          { error: "Each item must include productId and a positive quantity" },
          { status: 400 }
        );
      }

      const p = await db.query.products.findFirst({
        where: eq(products.id, raw.productId),
        with: { images: true },
      });

      if (!p || !p.isActive) {
        return NextResponse.json(
          { error: `Product not available: ${raw.productName ?? raw.productId}` },
          { status: 400 }
        );
      }

      const basePrice = Number(p.price);
      let unitPrice = basePrice;
      let variantName: string | undefined;
      let sku = p.sku ?? undefined;
      let available = p.stock;

      if (raw.variantId) {
        const v = await db.query.productVariants.findFirst({
          where: and(
            eq(productVariants.id, raw.variantId),
            eq(productVariants.productId, p.id)
          ),
        });
        if (!v || v.isActive === false) {
          return NextResponse.json(
            { error: `Invalid variant for ${p.name}` },
            { status: 400 }
          );
        }
        variantName = v.name;
        sku = v.sku ?? sku;
        unitPrice =
          v.price != null && String(v.price).trim() !== "" ? Number(v.price) : basePrice;
        available = v.stock;
      }

      if (qty > available) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${p.name}${variantName ? ` (${variantName})` : ""}: requested ${qty}, available ${available}`,
          },
          { status: 400 }
        );
      }

      const primaryImg = p.images?.find((img) => img.isPrimary)?.url ?? p.images?.[0]?.url;

      resolved.push({
        productId: p.id,
        variantId: raw.variantId || undefined,
        productName: p.name,
        variantName: variantName ?? raw.variantName,
        sku,
        quantity: qty,
        unitPrice,
        imageUrl: raw.imageUrl || primaryImg || undefined,
      });
    }

    const subtotal = resolved.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

    const rates = await getOrCreateShippingRates();
    const shippingCost = computeShippingLkr({
      delivery,
      subtotal,
      rates,
    });
    const total = subtotal + shippingCost - Number(discount);
    const orderNumber = generateOrderNumber();

    const order = await db.transaction(async (tx) => {
      const [o] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddressLine1,
          shippingAddressLine2,
          shippingCity,
          shippingDistrict,
          shippingProvince,
          shippingPostalCode: shippingPostalCode ?? undefined,
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          discount: String(discount),
          total: String(total),
          paymentMethod,
          customerNote,
          bankTransferReference:
            paymentMethod === "bank_transfer"
              ? String(bankTransferReference).trim()
              : undefined,
          bankTransferPayerName: bankTransferPayerName?.trim() || undefined,
          bankTransferProofUrl: bankTransferProofUrl?.trim() || undefined,
        })
        .returning();

      await tx.insert(orderItems).values(
        resolved.map((line) => ({
          orderId: o.id,
          productId: line.productId,
          variantId: line.variantId,
          productName: line.productName,
          variantName: line.variantName,
          sku: line.sku,
          quantity: line.quantity,
          unitPrice: String(line.unitPrice),
          subtotal: String(line.unitPrice * line.quantity),
          imageUrl: line.imageUrl,
        }))
      );

      await tx.insert(orderStatusHistory).values({
        orderId: o.id,
        status: o.status,
        note: "Order placed",
        changedBy: userId,
      });

      for (const line of resolved) {
        if (line.variantId) {
          const [row] = await tx
            .update(productVariants)
            .set({ stock: sql`${productVariants.stock} - ${line.quantity}` })
            .where(
              and(
                eq(productVariants.id, line.variantId),
                gte(productVariants.stock, line.quantity)
              )
            )
            .returning({ id: productVariants.id });
          if (!row) {
            throw new Error("INSUFFICIENT_STOCK_VARIANT");
          }
        } else {
          const [row] = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${line.quantity}` })
            .where(and(eq(products.id, line.productId), gte(products.stock, line.quantity)))
            .returning({ id: products.id });
          if (!row) {
            throw new Error("INSUFFICIENT_STOCK_PRODUCT");
          }
        }
      }

      return o;
    });

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        { error: "Stock changed while placing order — please refresh and try again" },
        { status: 409 }
      );
    }
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      status,
      trackingNumber,
      courierName,
      note,
      changedBy,
      shippingCost,
      discount,
      paymentStatus,
      adminNote,
      estimatedDeliveryDate,
    } = body as {
      orderId: string;
      status?: typeof orders.$inferSelect["status"];
      trackingNumber?: string | null;
      courierName?: string | null;
      note?: string;
      changedBy?: string;
      shippingCost?: number;
      discount?: number;
      paymentStatus?: typeof orders.$inferSelect["paymentStatus"];
      adminNote?: string;
      estimatedDeliveryDate?: string | null;
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let nextStatus: typeof existing.status = status ?? existing.status;

    if (
      paymentStatus === "paid" &&
      existing.paymentStatus !== "paid" &&
      existing.paymentMethod === "bank_transfer" &&
      existing.status === "pending" &&
      status === undefined
    ) {
      nextStatus = "confirmed";
    }

    const ship =
      shippingCost !== undefined ? Number(shippingCost) : Number(existing.shippingCost);
    const disc = discount !== undefined ? Number(discount) : Number(existing.discount);
    const subtotalNum = Number(existing.subtotal);
    const nextTotal = subtotalNum + ship - disc;

    const updateData: Partial<typeof orders.$inferInsert> = {
      status: nextStatus,
      trackingNumber:
        trackingNumber === undefined ? existing.trackingNumber : trackingNumber || null,
      courierName: courierName === undefined ? existing.courierName : courierName || null,
      updatedAt: new Date(),
    };

    if (shippingCost !== undefined || discount !== undefined) {
      updateData.shippingCost = String(ship);
      updateData.discount = String(disc);
      updateData.total = String(nextTotal);
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote || null;
    }

    if (estimatedDeliveryDate !== undefined) {
      updateData.estimatedDeliveryDate = estimatedDeliveryDate
        ? new Date(estimatedDeliveryDate)
        : null;
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "paid" && existing.paymentStatus !== "paid") {
        updateData.paidAt = new Date();
      }
    }

    if (nextStatus === "delivered") {
      updateData.deliveredAt = existing.deliveredAt ?? new Date();
    } else if (existing.status === "delivered") {
      updateData.deliveredAt = null;
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    if (nextStatus !== existing.status) {
      const autoBank =
        paymentStatus === "paid" &&
        existing.paymentStatus !== "paid" &&
        existing.paymentMethod === "bank_transfer" &&
        existing.status === "pending" &&
        status === undefined;
      await db.insert(orderStatusHistory).values({
        orderId,
        status: nextStatus,
        note:
          note ??
          (autoBank ? "Bank payment verified — order confirmed" : "Status updated from dashboard"),
        changedBy,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
