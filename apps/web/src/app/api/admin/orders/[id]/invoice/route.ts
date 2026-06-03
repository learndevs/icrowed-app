import { NextResponse } from "next/server";
import { db, getOrCreateStoreSettings, orders } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { buildInvoiceHtml, invoiceFilename } from "@/lib/invoice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const [order, store] = await Promise.all([
    db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    }),
    getOrCreateStoreSettings(),
  ]);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const html = buildInvoiceHtml(order, store);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${invoiceFilename(order.orderNumber)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
