import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in apps/web/.env.local");
  }
  _resend ??= new Resend(apiKey);
  return _resend;
}

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export type SendEmailResult =
  | { ok: true; id: string | undefined }
  | { ok: false; error: string };

function resolveFromAddress(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (raw) return raw;
  return "iCrowd <onboarding@resend.dev>";
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: EmailPayload): Promise<SendEmailResult> {
  const from = resolveFromAddress();
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id };
}
