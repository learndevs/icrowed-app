import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplateByKey } from "@icrowed/database";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/email-templates/loader";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { key } = await params;
    const { to, vars } = (await req.json()) as {
      to?: string;
      vars?: Record<string, unknown>;
    };
    if (!to) {
      return NextResponse.json({ error: "to (email) required" }, { status: 400 });
    }
    const row = await getEmailTemplateByKey(key);
    if (!row) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const sample = vars ?? {};
    const subject = renderTemplate(row.subject, sample);
    const html = renderTemplate(row.bodyHtml, sample);
    const result = await sendEmail({ to, subject, html });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[POST /api/admin/email-templates/[key]/test]", err);
    return NextResponse.json({ error: "Failed to send test" }, { status: 500 });
  }
}
