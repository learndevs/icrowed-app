import { baseTemplate, button, divider } from "./base";

export type ResetPasswordData = {
  resetUrl: string;
};

export function resetPasswordTemplate(data: ResetPasswordData): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Reset your password</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      We received a request to reset your iCrowd account password. Click below to choose a new password.
    </p>
    ${button("Reset password", data.resetUrl)}
    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5;">
      This link expires in 1 hour. If you did not request a reset, you can safely ignore this email.
    </p>
  `;
  return baseTemplate(content);
}
