import type { TemplateKey } from "./loader";

const BASE = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>iCrowed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#111827;padding:28px 40px;border-radius:12px 12px 0 0;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">iCrowed</span>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:40px;border-radius:0 0 12px 12px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:13px;">© 2025 iCrowed. All rights reserved.</p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:13px;">Questions? Reply to this email or contact our support team.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const BTN = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">${label}</a>`;

const DIVIDER = `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />`;

const LABEL = (t: string) =>
  `<p style="margin:24px 0 6px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">${t}</p>`;

const ORDER_BOX = (num: string) =>
  `<div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin:16px 0;">
     <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">Order Number</p>
     <p style="margin:6px 0 0;color:#111827;font-size:20px;font-weight:700;">${num}</p>
   </div>`;

export interface TemplateDefault {
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

export const TEMPLATE_DEFAULTS: Record<TemplateKey, TemplateDefault> = {

  /* ── Order Confirmation ─────────────────────────── */
  order_confirmation: {
    subject: "Order {{orderNumber}} confirmed – thank you!",
    bodyText: "Hi {{customerName}}, your order {{orderNumber}} has been confirmed. Total: LKR {{total}}. Track at {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Thank you for your order! 🎉</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, we've received your order and it's being reviewed.</p>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${LABEL("Payment Method")}
      <p style="margin:0;color:#374151;font-size:14px;">{{paymentMethod}}</p>
      ${LABEL("Order Total")}
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">LKR {{total}}</p>
      ${DIVIDER}
      <p style="margin:0;color:#6b7280;font-size:14px;">You'll receive another email when your order is shipped.</p>
      ${BTN("Track Your Order", "{{appUrl}}/orders")}
    `),
  },

  /* ── Payment Confirmed ──────────────────────────── */
  payment_confirmed: {
    subject: "Payment received for order {{orderNumber}}",
    bodyText: "Hi {{customerName}}, payment for order {{orderNumber}} (LKR {{total}}) has been confirmed. Track at {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Payment confirmed ✅</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, your payment has been received successfully.</p>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${LABEL("Amount Paid")}
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">LKR {{total}}</p>
      ${DIVIDER}
      <p style="margin:0;color:#6b7280;font-size:14px;">We're now preparing your order for dispatch. You'll receive a shipping notification soon.</p>
      ${BTN("View Order", "{{appUrl}}/orders")}
    `),
  },

  /* ── Order Shipped ──────────────────────────────── */
  order_shipped: {
    subject: "Your order {{orderNumber}} is on its way! 🚚",
    bodyText: "Hi {{customerName}}, order {{orderNumber}} has been shipped via {{courierName}}. Tracking: {{trackingNumber}}. Track at {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Your order is on its way! 🚚</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, great news — your order has been dispatched.</p>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${LABEL("Courier")}
      <p style="margin:0;color:#374151;font-size:15px;font-weight:600;">{{courierName}}</p>
      ${LABEL("Tracking Number")}
      <p style="margin:0;color:#4f46e5;font-size:15px;font-weight:700;font-family:monospace;">{{trackingNumber}}</p>
      ${DIVIDER}
      <p style="margin:0;color:#6b7280;font-size:14px;">Use the tracking number above on the courier's website to follow your delivery.</p>
      ${BTN("Track Your Delivery", "{{appUrl}}/orders")}
    `),
  },

  /* ── Order Delivered ────────────────────────────── */
  order_delivered: {
    subject: "Your order {{orderNumber}} has been delivered!",
    bodyText: "Hi {{customerName}}, order {{orderNumber}} has been delivered. Enjoy! Visit {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Order delivered! 📦</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, your order has arrived. We hope you love it!</p>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${DIVIDER}
      <p style="margin:0;color:#6b7280;font-size:14px;">Enjoying your purchase? We'd love to hear what you think. Leave a review on our website — it helps other customers too.</p>
      ${BTN("Leave a Review", "{{appUrl}}/orders")}
    `),
  },

  /* ── Order Refunded ─────────────────────────────── */
  order_refunded: {
    subject: "Refund of LKR {{refundAmount}} processed for order {{orderNumber}}",
    bodyText: "Hi {{customerName}}, a refund of LKR {{refundAmount}} has been processed for order {{orderNumber}} via {{paymentMethod}}. Visit {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Refund processed</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, your refund has been initiated.</p>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${LABEL("Refund Amount")}
      <p style="margin:0;color:#059669;font-size:20px;font-weight:700;">LKR {{refundAmount}}</p>
      ${LABEL("Refund Method")}
      <p style="margin:0;color:#374151;font-size:14px;">{{paymentMethod}}</p>
      ${DIVIDER}
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
        <p style="margin:0;color:#166534;font-size:14px;">Refunds typically appear within <strong>5–10 business days</strong> depending on your bank or card provider.</p>
      </div>
      ${BTN("Visit iCrowed", "{{appUrl}}")}
    `),
  },

  /* ── Welcome ────────────────────────────────────── */
  welcome: {
    subject: "Welcome to iCrowed, {{customerName}}! 👋",
    bodyText: "Hi {{customerName}}, welcome to iCrowed — Sri Lanka's premier tech store. Start shopping at {{appUrl}}",
    bodyHtml: BASE(`
      <h1 style="margin:0 0 6px;color:#111827;font-size:24px;font-weight:700;">Welcome to iCrowed! 👋</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi {{customerName}}, we're thrilled to have you on board.</p>
      ${DIVIDER}
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        At iCrowed we offer the latest smartphones, accessories, and tech — delivered right to your door across Sri Lanka.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;width:30%;">
            <p style="margin:0;font-size:22px;">📱</p>
            <p style="margin:6px 0 0;color:#374151;font-size:13px;font-weight:600;">Latest Devices</p>
          </td>
          <td width="12"></td>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;width:30%;">
            <p style="margin:0;font-size:22px;">🚀</p>
            <p style="margin:6px 0 0;color:#374151;font-size:13px;font-weight:600;">Fast Delivery</p>
          </td>
          <td width="12"></td>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;width:30%;">
            <p style="margin:0;font-size:22px;">🛡️</p>
            <p style="margin:6px 0 0;color:#374151;font-size:13px;font-weight:600;">Warranty Assured</p>
          </td>
        </tr>
      </table>
      ${BTN("Start Shopping", "{{appUrl}}")}
    `),
  },

  /* ── Low Stock Alert (admin) ────────────────────── */
  low_stock_alert: {
    subject: "⚠️ Low stock alert: {{productName}}",
    bodyText: "Admin alert: {{productName}} is running low ({{currentStock}} units left, threshold: {{threshold}}). Visit {{appUrl}}/admin/inventory",
    bodyHtml: BASE(`
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
        <p style="margin:0;color:#854d0e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">⚠️ Admin Alert — Low Stock</p>
      </div>
      <h1 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">{{productName}}</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Stock has dropped below the alert threshold.</p>
      ${DIVIDER}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:16px;background:#fef2f2;border-radius:8px;text-align:center;width:45%;">
            <p style="margin:0;color:#dc2626;font-size:28px;font-weight:800;">{{currentStock}}</p>
            <p style="margin:4px 0 0;color:#ef4444;font-size:12px;font-weight:600;text-transform:uppercase;">Current Stock</p>
          </td>
          <td width="16"></td>
          <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:45%;">
            <p style="margin:0;color:#374151;font-size:28px;font-weight:800;">{{threshold}}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Alert Threshold</p>
          </td>
        </tr>
      </table>
      ${BTN("Go to Inventory", "{{appUrl}}/admin/inventory")}
    `),
  },

  /* ── New Order Admin ────────────────────────────── */
  new_order_admin: {
    subject: "New order {{orderNumber}} received – LKR {{total}}",
    bodyText: "New order {{orderNumber}} from {{customerName}} for LKR {{total}}. View at {{appUrl}}/admin/orders",
    bodyHtml: BASE(`
      <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
        <p style="margin:0;color:#3730a3;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">🛒 New Order Received</p>
      </div>
      <h1 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">A new order just came in!</h1>
      ${DIVIDER}
      ${ORDER_BOX("{{orderNumber}}")}
      ${LABEL("Customer")}
      <p style="margin:0;color:#374151;font-size:15px;font-weight:600;">{{customerName}}</p>
      ${LABEL("Order Total")}
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">LKR {{total}}</p>
      ${BTN("View Order in Admin", "{{appUrl}}/admin/orders")}
    `),
  },

  /* ── Review Admin ───────────────────────────────── */
  review_admin: {
    subject: "New {{rating}}★ review on {{productName}}",
    bodyText: "{{reviewerName}} left a {{rating}}-star review on {{productName}}. View at {{appUrl}}/admin/reviews",
    bodyHtml: BASE(`
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
        <p style="margin:0;color:#166534;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">⭐ New Review Submitted</p>
      </div>
      <h1 style="margin:0 0 6px;color:#111827;font-size:20px;font-weight:700;">{{productName}}</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">A customer just left a new review.</p>
      ${DIVIDER}
      ${LABEL("Reviewer")}
      <p style="margin:0;color:#374151;font-size:15px;font-weight:600;">{{reviewerName}}</p>
      ${LABEL("Rating")}
      <p style="margin:0;font-size:24px;">
        ${"⭐".repeat(1)}<!-- rendered: {{rating}} stars -->
        <span style="color:#111827;font-size:16px;font-weight:700;vertical-align:middle;margin-left:4px;">{{rating}} / 5</span>
      </p>
      ${BTN("Moderate Review", "{{appUrl}}/admin/reviews")}
    `),
  },
};
