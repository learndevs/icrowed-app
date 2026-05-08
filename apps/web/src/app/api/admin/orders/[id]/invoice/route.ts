import { NextResponse } from "next/server";
import { db, getOrCreateStoreSettings, orders } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

function escapeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(value: unknown, currency = "LKR") {
  return `${currency} ${Number(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function filenameFor(orderNumber: string) {
  return `${orderNumber.replace(/[^a-z0-9-]/gi, "_")}-invoice.html`;
}

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

  const currency = store.currency || "LKR";
  const addressLines = [
    store.addressLine1,
    store.addressLine2,
    store.city,
    store.country,
  ].filter(Boolean);
  const shippingLines = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    `${order.shippingCity}, ${order.shippingDistrict}`,
    order.shippingProvince,
    order.shippingPostalCode,
  ].filter(Boolean);

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.productName)}</strong>
            ${item.variantName ? `<br><span>${escapeHtml(item.variantName)}</span>` : ""}
            ${item.sku ? `<br><small>SKU: ${escapeHtml(item.sku)}</small>` : ""}
          </td>
          <td class="num">${escapeHtml(item.quantity)}</td>
          <td class="num">${escapeHtml(formatMoney(item.unitPrice, currency))}</td>
          <td class="num">${escapeHtml(formatMoney(item.subtotal, currency))}</td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${escapeHtml(order.orderNumber)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f8fafc;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }
    .page {
      max-width: 920px;
      margin: 32px auto;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #111827;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 34px; letter-spacing: 0; }
    h2 { font-size: 18px; margin-bottom: 8px; }
    .muted { color: #6b7280; }
    .store { max-width: 340px; }
    .meta { text-align: right; }
    .meta dl { margin: 8px 0 0; display: grid; grid-template-columns: auto auto; gap: 4px 14px; }
    .meta dt { color: #6b7280; }
    .meta dd { margin: 0; font-weight: 700; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
    .box {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 18px;
      min-height: 150px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th {
      background: #f3f4f6;
      color: #4b5563;
      font-size: 12px;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    td span, td small { color: #6b7280; }
    .num { text-align: right; white-space: nowrap; }
    .totals { width: min(360px, 100%); margin-left: auto; margin-top: 24px; }
    .totals div { display: flex; justify-content: space-between; padding: 7px 0; }
    .totals .grand {
      border-top: 2px solid #111827;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 20px;
      font-weight: 800;
    }
    .note { margin-top: 28px; color: #6b7280; font-size: 13px; }
    .toolbar { max-width: 920px; margin: 24px auto -16px; text-align: right; }
    .toolbar button {
      height: 36px;
      padding: 0 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-weight: 700;
    }
    @media print {
      body { background: #fff; }
      .toolbar { display: none; }
      .page { margin: 0; max-width: none; border: 0; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Print / Save PDF</button></div>
  <main class="page">
    <header>
      <section class="store">
        <h1>${escapeHtml(store.storeName || "iCrowed")}</h1>
        <p class="muted">${addressLines.map(escapeHtml).join("<br>")}</p>
        ${store.storeEmail ? `<p class="muted">${escapeHtml(store.storeEmail)}</p>` : ""}
        ${store.supportPhone ? `<p class="muted">${escapeHtml(store.supportPhone)}</p>` : ""}
      </section>
      <section class="meta">
        <h2>Invoice</h2>
        <dl>
          <dt>Invoice #</dt><dd>${escapeHtml(order.orderNumber)}</dd>
          <dt>Order date</dt><dd>${escapeHtml(formatDate(order.createdAt))}</dd>
          <dt>Status</dt><dd>${escapeHtml(order.status)}</dd>
          <dt>Payment</dt><dd>${escapeHtml(order.paymentStatus)}</dd>
        </dl>
      </section>
    </header>

    <section class="grid">
      <div class="box">
        <h3>Bill To</h3>
        <p><strong>${escapeHtml(order.customerName)}</strong></p>
        <p class="muted">${escapeHtml(order.customerEmail)}<br>${escapeHtml(order.customerPhone)}</p>
      </div>
      <div class="box">
        <h3>Ship To</h3>
        <p class="muted">${shippingLines.map(escapeHtml).join("<br>")}</p>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <section class="totals">
      <div><span>Subtotal</span><strong>${escapeHtml(formatMoney(order.subtotal, currency))}</strong></div>
      <div><span>Shipping</span><strong>${escapeHtml(formatMoney(order.shippingCost, currency))}</strong></div>
      ${
        Number(order.discount) > 0
          ? `<div><span>Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</span><strong>-${escapeHtml(formatMoney(order.discount, currency))}</strong></div>`
          : ""
      }
      <div class="grand"><span>Total</span><span>${escapeHtml(formatMoney(order.total, currency))}</span></div>
    </section>

    <p class="note">
      Payment method: ${escapeHtml(order.paymentMethod)}
      ${order.trackingNumber ? `<br>Tracking: ${escapeHtml(order.trackingNumber)}` : ""}
      ${order.customerNote ? `<br>Customer note: ${escapeHtml(order.customerNote)}` : ""}
    </p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameFor(order.orderNumber)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
