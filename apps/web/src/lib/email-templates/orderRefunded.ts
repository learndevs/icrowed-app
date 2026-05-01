import { baseTemplate, divider } from "./base";

export type OrderRefundedData = {
  customerName: string;
  orderNumber: string;
  refundAmount: string | number;
  paymentMethod: string;
  appUrl: string;
};

export function orderRefundedTemplate(data: OrderRefundedData): string {
  const isBankTransfer = data.paymentMethod === "bank_transfer";

  const content = `
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="display:inline-block;font-size:40px;margin-bottom:12px;">💸</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Your refund has been processed</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${data.customerName}, a refund for order <strong>${data.orderNumber}</strong> has been initiated.</p>
    </div>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Order Number</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${data.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Refund Amount</td>
        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">LKR ${Number(data.refundAmount).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Status</td>
        <td style="padding:8px 0;text-align:right;">
          <span style="background:#dbeafe;color:#1e40af;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;">Refunded</span>
        </td>
      </tr>
    </table>

    ${divider()}

    ${isBankTransfer ? `
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px 20px;">
      <p style="margin:0 0 6px;color:#92400e;font-size:14px;font-weight:600;">Bank Transfer Refund</p>
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
        Your refund will be processed manually and transferred back to your original payment account within 3–5 business days.
        If you have any questions, please reply to this email.
      </p>
    </div>` : `
    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
      Your refund has been issued to your original payment method. Please allow <strong>5–10 business days</strong>
      for the amount to appear on your statement, depending on your card issuer.
    </p>`}
  `;

  return baseTemplate(content);
}
