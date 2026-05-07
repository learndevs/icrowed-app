import { NextRequest, NextResponse } from "next/server";
import { db, orders } from "@icrowed/database";
import { and, desc, eq, gte, lte, SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const from = sp.get("from");
  const to = sp.get("to");

  const conds: SQL[] = [];
  if (status) {
    conds.push(eq(orders.status, status as typeof orders.$inferSelect.status));
  }
  if (from) conds.push(gte(orders.createdAt, new Date(from)));
  if (to) conds.push(lte(orders.createdAt, new Date(to)));

  const rows = await db
    .select()
    .from(orders)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(10000);

  const header = [
    "orderNumber",
    "createdAt",
    "status",
    "customerName",
    "customerEmail",
    "customerPhone",
    "subtotal",
    "shippingCost",
    "discount",
    "total",
    "paymentMethod",
    "paymentStatus",
    "couponCode",
    "trackingNumber",
    "courierName",
    "shippingCity",
    "shippingDistrict",
  ];

  const lines = [header.join(",")];
  for (const o of rows) {
    lines.push(
      [
        o.orderNumber,
        o.createdAt?.toISOString?.() ?? o.createdAt,
        o.status,
        o.customerName,
        o.customerEmail,
        o.customerPhone,
        o.subtotal,
        o.shippingCost,
        o.discount,
        o.total,
        o.paymentMethod,
        o.paymentStatus,
        o.couponCode ?? "",
        o.trackingNumber ?? "",
        o.courierName ?? "",
        o.shippingCity,
        o.shippingDistrict,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${stamp}.csv"`,
    },
  });
}
