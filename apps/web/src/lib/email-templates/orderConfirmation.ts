import { baseTemplate, button, divider, itemsTable, sectionLabel } from "./base";

export type OrderConfirmationData = {
  customerName: string;
  orderNumber: string;
  items: { productName: string; variantName?: string | null; quantity: number; unitPrice: string | number }[];
  subtotal: string | number;
  shippingCost: string | number;
  discount: string | number;
  total: string | number;
  shippingAddress: string;
  paymentMethod: string;
  appUrl: string;
};

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const paymentLabel =
    data.paymentMethod === "stripe" ? "Credit / Debit Card (Stripe)" : "Bank Transfer";

  const content = `
    <h1 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">Thank you for your order!</h1>
    <p style="margin:0 0 4px;color:#6b7280;font-size:15px;">Hi ${data.customerName}, we've received your order and it's being reviewed.</p>

    ${divider()}

    <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;display:inline-block;width:100%;box-sizing:border-box;">
      <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order Number</p>
      <p style="margin:4px 0 0;color:#111827;font-size:20px;font-weight:700;">${data.orderNumber}</p>
    </div>

    ${sectionLabel("Items Ordered")}
    ${itemsTable(data.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Subtotal</td>
        <td style="padding:4px 0;color:#111827;font-size:14px;text-align:right;">LKR ${Number(data.subtotal).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Shipping</td>
        <td style="padding:4px 0;color:#111827;font-size:14px;text-align:right;">LKR ${Number(data.shippingCost).toLocaleString()}</td>
      </tr>
      ${Number(data.discount) > 0 ? `<tr>
        <td style="padding:4px 0;color:#059669;font-size:14px;">Discount</td>
        <td style="padding:4px 0;color:#059669;font-size:14px;text-align:right;">- LKR ${Number(data.discount).toLocaleString()}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 0 4px;color:#111827;font-size:15px;font-weight:700;border-top:2px solid #e5e7eb;">Total</td>
        <td style="padding:12px 0 4px;color:#111827;font-size:15px;font-weight:700;text-align:right;border-top:2px solid #e5e7eb;">LKR ${Number(data.total).toLocaleString()}</td>
      </tr>
    </table>

    ${divider()}

    ${sectionLabel("Shipping To")}
    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${data.shippingAddress}</p>

    ${sectionLabel("Payment Method")}
    <p style="margin:0;color:#374151;font-size:14px;">${paymentLabel}</p>

    ${data.paymentMethod === "bank_transfer" ? `
    ${divider()}
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px 20px;">
      <p style="margin:0 0 6px;color:#92400e;font-size:14px;font-weight:600;">Bank Transfer Instructions</p>
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
        Please complete your bank transfer and use <strong>${data.orderNumber}</strong> as the payment reference.
        Your order will be confirmed once payment is verified by our team.
      </p>
    </div>` : ""}

    ${button("Track Your Order", `${data.appUrl}/track?order=${data.orderNumber}`)}
  `;

  return baseTemplate(content);
}
