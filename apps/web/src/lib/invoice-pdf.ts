import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatInvoiceDate,
  formatMoney,
  invoiceFilename,
  paymentMethodLabel,
  type OrderWithItems,
  type StoreSettings,
} from "./invoice";

export function buildInvoicePdfBuffer(order: OrderWithItems, store: StoreSettings): Buffer {
  const currency = store.currency || "LKR";
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  const storeLines = [
    store.storeName || "iCrowd",
    store.addressLine1,
    store.addressLine2,
    [store.city, store.country].filter(Boolean).join(", "),
    store.storeEmail,
    store.supportPhone,
  ].filter(Boolean) as string[];

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(storeLines[0] ?? "iCrowd", margin, y);
  y += 22;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  for (const line of storeLines.slice(1)) {
    doc.text(line, margin, y);
    y += 14;
  }

  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", doc.internal.pageSize.getWidth() - margin, margin, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const metaX = doc.internal.pageSize.getWidth() - margin;
  let metaY = margin + 22;
  const metaRows: [string, string][] = [
    ["Invoice #", order.orderNumber],
    ["Order date", formatInvoiceDate(order.createdAt)],
    ["Status", order.status],
    ["Payment", order.paymentStatus],
  ];
  for (const [label, value] of metaRows) {
    doc.setTextColor(120);
    doc.text(label, metaX, metaY, { align: "right" });
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(value, metaX, metaY + 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    metaY += 28;
  }

  y = Math.max(y, metaY) + 16;
  doc.setDrawColor(30);
  doc.setLineWidth(1);
  doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
  y += 24;

  const shipTo = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    `${order.shippingCity}, ${order.shippingDistrict}`,
    order.shippingProvince,
    order.shippingPostalCode,
  ]
    .filter(Boolean)
    .join("\n");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", margin, y);
  doc.text("Ship To", doc.internal.pageSize.getWidth() / 2 + 10, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(order.customerName, margin, y);
  doc.text(shipTo, doc.internal.pageSize.getWidth() / 2 + 10, y);
  y += 14;
  doc.setTextColor(100);
  doc.text(`${order.customerEmail}\n${order.customerPhone}`, margin, y);
  doc.setTextColor(0);
  y += 40;

  autoTable(doc, {
    startY: y,
    head: [["Item", "Qty", "Unit Price", "Amount"]],
    body: order.items.map((item) => {
      const name = [
        item.productName,
        item.variantName ? `(${item.variantName})` : null,
        item.sku ? `SKU: ${item.sku}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      return [
        name,
        String(item.quantity),
        formatMoney(item.unitPrice, currency),
        formatMoney(item.subtotal, currency),
      ];
    }),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY;
  y = (finalY ?? y) + 24;
  const totalsX = doc.internal.pageSize.getWidth() - margin - 180;

  const totalRows: [string, string][] = [
    ["Subtotal", formatMoney(order.subtotal, currency)],
    ["Shipping", formatMoney(order.shippingCost, currency)],
  ];
  if (Number(order.discount) > 0) {
    totalRows.push([
      order.couponCode ? `Discount (${order.couponCode})` : "Discount",
      `-${formatMoney(order.discount, currency)}`,
    ]);
  }
  totalRows.push(["Total", formatMoney(order.total, currency)]);

  doc.setFontSize(10);
  for (const [label, value] of totalRows) {
    const isGrand = label === "Total";
    doc.setFont("helvetica", isGrand ? "bold" : "normal");
    doc.setFontSize(isGrand ? 12 : 10);
    doc.text(label, totalsX, y);
    doc.text(value, doc.internal.pageSize.getWidth() - margin, y, { align: "right" });
    y += isGrand ? 20 : 16;
  }

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const notes = [
    `Payment method: ${paymentMethodLabel(order.paymentMethod)}`,
    order.trackingNumber ? `Tracking: ${order.trackingNumber}` : null,
    order.customerNote ? `Customer note: ${order.customerNote}` : null,
  ].filter(Boolean) as string[];
  doc.text(notes.join("\n"), margin, y);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export { invoiceFilename };
