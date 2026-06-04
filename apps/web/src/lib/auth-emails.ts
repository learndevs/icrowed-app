import "server-only";

import { sendEmail } from "@/lib/email";
import { createAuthActionToken } from "@/lib/auth-action-token";
import { verifyEmailTemplate } from "@/lib/email-templates/verifyEmail";
import { resetPasswordTemplate } from "@/lib/email-templates/resetPassword";

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export async function sendVerificationEmail(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const token = await createAuthActionToken({
    sub: input.userId,
    email: input.email,
    purpose: "email_verify",
  });
  const verifyUrl = `${appBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const name = input.fullName?.trim() || input.email.split("@")[0];

  const result = await sendEmail({
    to: input.email,
    subject: "Verify your iCrowd account",
    html: verifyEmailTemplate({ customerName: name, verifyUrl }),
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function sendPasswordResetEmail(input: {
  userId: string;
  email: string;
}): Promise<{ ok: boolean; error?: string }> {
  const token = await createAuthActionToken({
    sub: input.userId,
    email: input.email,
    purpose: "password_reset",
  });
  const resetUrl = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const result = await sendEmail({
    to: input.email,
    subject: "Reset your iCrowd password",
    html: resetPasswordTemplate({ resetUrl }),
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}
