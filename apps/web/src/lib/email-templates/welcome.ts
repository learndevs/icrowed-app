import { baseTemplate, button, divider } from "./base";

export type WelcomeData = {
  customerName: string;
  appUrl: string;
};

export function welcomeTemplate(data: WelcomeData): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Welcome to iCrowed! 🎉</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi ${data.customerName}, your account has been created and you're ready to shop.</p>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 16px;background:#f9fafb;border-radius:8px;width:40px;vertical-align:top;font-size:20px;">🛍️</td>
        <td style="padding:12px 16px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:600;">Browse our catalogue</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Thousands of products across all categories.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:6px 0;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#f9fafb;border-radius:8px;width:40px;vertical-align:top;font-size:20px;">📦</td>
        <td style="padding:12px 16px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:600;">Track your orders</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Get real-time updates from checkout to your door.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:6px 0;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#f9fafb;border-radius:8px;width:40px;vertical-align:top;font-size:20px;">⭐</td>
        <td style="padding:12px 16px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:600;">Leave reviews</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Help the community by sharing your honest feedback.</p>
        </td>
      </tr>
    </table>

    ${divider()}

    ${button("Start Shopping", `${data.appUrl}/products`)}
  `;

  return baseTemplate(content);
}
