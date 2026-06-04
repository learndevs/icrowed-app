import { baseTemplate, button, divider } from "./base";

export type VerifyEmailData = {
  customerName: string;
  verifyUrl: string;
};

export function verifyEmailTemplate(data: VerifyEmailData): string {
  const content = `
    <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Verify your email</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Hi ${data.customerName}, thanks for signing up with iCrowd. Confirm your email to activate your account.
    </p>
    ${button("Verify email address", data.verifyUrl)}
    ${divider()}
    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5;">
      This link expires in 24 hours. If you did not create an account, you can ignore this email.
    </p>
  `;
  return baseTemplate(content);
}
