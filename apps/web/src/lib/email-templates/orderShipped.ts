import { baseTemplate, button, divider } from "./base";

export type OrderShippedData = {
  customerName: string;
  orderNumber: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  appUrl: string;
};

export function orderShippedTemplate(data: OrderShippedData): string {
  const content = `
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="display:inline-block;font-size:40px;margin-bottom:12px;">🚚</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Your order is on its way!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${data.customerName}, your order <strong>${data.orderNumber}</strong> has been dispatched.</p>
    </div>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Order Number</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.orderNumber}</td>
      </tr>
      ${data.courierName ? `<tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Courier</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.courierName}</td>
      </tr>` : ""}
      ${data.trackingNumber ? `<tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Tracking Number</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.trackingNumber}</td>
      </tr>` : ""}
      ${data.estimatedDelivery ? `<tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Est. Delivery</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.estimatedDelivery}</td>
      </tr>` : ""}
    </table>

    ${divider()}

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
      You can track your delivery status at any time using the button below.
    </p>

    <div style="text-align:center;">
      ${button("Track Delivery", `${data.appUrl}/track?order=${data.orderNumber}`)}
    </div>
  `;

  return baseTemplate(content);
}
