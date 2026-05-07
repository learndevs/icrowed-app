import { getEmailTemplateByKey } from "@icrowed/database";

export type TemplateKey =
  | "order_confirmation"
  | "payment_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_refunded"
  | "welcome"
  | "low_stock_alert"
  | "new_order_admin"
  | "review_admin";

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  order_confirmation: "Order confirmation",
  payment_confirmed: "Payment confirmed",
  order_shipped: "Order shipped",
  order_delivered: "Order delivered",
  order_refunded: "Order refunded",
  welcome: "Welcome (new account)",
  low_stock_alert: "Low stock alert (admin)",
  new_order_admin: "New order received (admin)",
  review_admin: "New review submitted (admin)",
};

export const TEMPLATE_VARIABLES: Record<TemplateKey, string[]> = {
  order_confirmation: [
    "customerName",
    "orderNumber",
    "total",
    "appUrl",
    "paymentMethod",
  ],
  payment_confirmed: ["customerName", "orderNumber", "total", "appUrl"],
  order_shipped: [
    "customerName",
    "orderNumber",
    "courierName",
    "trackingNumber",
    "appUrl",
  ],
  order_delivered: ["customerName", "orderNumber", "appUrl"],
  order_refunded: [
    "customerName",
    "orderNumber",
    "refundAmount",
    "paymentMethod",
    "appUrl",
  ],
  welcome: ["customerName", "appUrl"],
  low_stock_alert: ["productName", "currentStock", "threshold", "appUrl"],
  new_order_admin: ["orderNumber", "customerName", "total", "appUrl"],
  review_admin: ["productName", "rating", "reviewerName", "appUrl"],
};

/**
 * Substitutes {{variableName}} tokens in `tpl` with values from `vars`.
 * Missing variables become empty strings.
 */
export function renderTemplate(tpl: string, vars: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return v == null ? "" : String(v);
  });
}

/**
 * Loads the template from the DB if present and active. Returns null if the
 * caller should fall back to the hardcoded compiled template (existing helper
 * functions in this folder).
 */
export async function loadCustomTemplate(key: TemplateKey) {
  try {
    const row = await getEmailTemplateByKey(key);
    if (!row || !row.isActive) return null;
    return row;
  } catch (err) {
    console.error("loadCustomTemplate", err);
    return null;
  }
}

/**
 * Render a custom template loaded from the DB.
 * Returns { subject, html } or null if the template is unavailable.
 */
export async function renderCustomTemplate(
  key: TemplateKey,
  vars: Record<string, unknown>
): Promise<{ subject: string; html: string } | null> {
  const row = await loadCustomTemplate(key);
  if (!row) return null;
  return {
    subject: renderTemplate(row.subject, vars),
    html: renderTemplate(row.bodyHtml, vars),
  };
}
