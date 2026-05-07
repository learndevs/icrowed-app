import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { rangeToDates } from "@/components/ui/DateRangePicker";
import {
  getKpis,
  getRevenueDaily,
  getOrdersByStatus,
  getPaymentMethodSplit,
  getTopProducts,
  getTopCustomers,
} from "@/lib/admin-queries";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(values: unknown[]): string {
  return values.map(csvEscape).join(",");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const sp = req.nextUrl.searchParams;
  const range = rangeToDates(sp.get("range"), sp.get("from"), sp.get("to"));

  const [kpis, daily, status, payments, topProducts, topCustomers] =
    await Promise.all([
      getKpis(range),
      getRevenueDaily(range),
      getOrdersByStatus(range),
      getPaymentMethodSplit(range),
      getTopProducts(range, 25),
      getTopCustomers(range, 25),
    ]);

  const lines: string[] = [];
  lines.push(
    `# iCrowed analytics export — ${range.from.toISOString()} → ${range.to.toISOString()}`
  );
  lines.push("");
  lines.push("Section,Metric,Value");
  lines.push(csvRow(["KPIs", "Revenue", kpis.revenue]));
  lines.push(csvRow(["KPIs", "Orders", kpis.ordersCount]));
  lines.push(csvRow(["KPIs", "AOV", kpis.aov]));
  lines.push(csvRow(["KPIs", "Refund count", kpis.refundCount]));
  lines.push(csvRow(["KPIs", "Refund rate %", kpis.refundRate.toFixed(2)]));
  lines.push(csvRow(["KPIs", "New customers", kpis.newCustomers]));
  lines.push("");
  lines.push("Daily revenue");
  lines.push(csvRow(["Day", "Revenue", "Orders"]));
  daily.forEach((d) => lines.push(csvRow([d.day, d.revenue, d.orderCount])));
  lines.push("");
  lines.push("Orders by status");
  lines.push(csvRow(["Status", "Count"]));
  status.forEach((s) => lines.push(csvRow([s.status, s.count])));
  lines.push("");
  lines.push("Payment method split");
  lines.push(csvRow(["Method", "Count", "Total"]));
  payments.forEach((p) => lines.push(csvRow([p.method, p.count, p.total])));
  lines.push("");
  lines.push("Top products");
  lines.push(csvRow(["Rank", "Product", "Revenue", "Quantity"]));
  topProducts.forEach((p, i) =>
    lines.push(csvRow([i + 1, p.productName, p.revenue, p.qty]))
  );
  lines.push("");
  lines.push("Top customers");
  lines.push(csvRow(["Rank", "Name", "Email", "Orders", "Revenue"]));
  topCustomers.forEach((c, i) =>
    lines.push(
      csvRow([i + 1, c.customerName, c.customerEmail, c.orderCount, c.revenue])
    )
  );

  const csv = lines.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${
        range.from.toISOString().slice(0, 10)
      }-to-${range.to.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
