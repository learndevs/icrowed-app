import { baseTemplate, button, divider } from "./base";

export type OrderDeliveredData = {
  customerName: string;
  orderNumber: string;
  appUrl: string;
};

export function orderDeliveredTemplate(data: OrderDeliveredData): string {
  const content = `
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="display:inline-block;font-size:40px;margin-bottom:12px;">📦</div>
      <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Your order has been delivered!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;">Hi ${data.customerName}, order <strong>${data.orderNumber}</strong> has been successfully delivered.</p>
    </div>

    ${divider()}

    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">
      We hope you love your purchase! If anything is not right, please reach out to our support team and we'll make it right.
    </p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;text-align:center;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">How was your experience?</p>
      <p style="margin:0;color:#6b7280;font-size:13px;">Leave a review to help other shoppers and earn trust points.</p>
      <div style="margin-top:16px;">
        ${button("Write a Review", `${data.appUrl}/products`)}
      </div>
    </div>
  `;

  return baseTemplate(content);
}
