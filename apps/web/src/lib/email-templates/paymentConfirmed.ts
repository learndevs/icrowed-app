import { baseTemplate, button, divider } from "./base";

export type PaymentConfirmedData = {
  customerName: string;
  orderNumber: string;
  total: string | number;
  appUrl: string;
};

export function paymentConfirmedTemplate(data: PaymentConfirmedData): string {
  const content = `
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="display:inline-block;background:#d1fae5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:16px;">✓</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Payment Confirmed!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${data.customerName}, your payment has been received and your order is now confirmed.</p>
    </div>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Order Number</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Amount Paid</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">LKR ${Number(data.total).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Status</td>
        <td style="padding:8px 0;text-align:right;">
          <span style="background:#d1fae5;color:#065f46;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;">Confirmed</span>
        </td>
      </tr>
    </table>

    ${divider()}

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
      We are now processing your order. You'll receive another email once your items have been dispatched.
    </p>

    <div style="text-align:center;">
      ${button("View Order", `${data.appUrl}/track?order=${data.orderNumber}`)}
    </div>
  `;

  return baseTemplate(content);
}
