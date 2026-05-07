import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplateByKey, upsertEmailTemplate } from "@icrowed/database";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { TEMPLATE_LABELS, TEMPLATE_VARIABLES, type TemplateKey } from "@/lib/email-templates/loader";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { key } = await params;
  const row = await getEmailTemplateByKey(key);
  if (!row) {
    const k = key as TemplateKey;
    return NextResponse.json({
      key,
      label: TEMPLATE_LABELS[k] ?? key,
      subject: "",
      bodyHtml: "",
      bodyText: "",
      variables: TEMPLATE_VARIABLES[k] ?? [],
      isActive: false,
      isNew: true,
    });
  }
  return NextResponse.json(row);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { key } = await params;
    const body = (await req.json()) as {
      subject?: string;
      bodyHtml?: string;
      bodyText?: string | null;
      isActive?: boolean;
      label?: string;
    };
    if (!body.subject || !body.bodyHtml) {
      return NextResponse.json(
        { error: "subject and bodyHtml are required" },
        { status: 400 }
      );
    }
    const before = await getEmailTemplateByKey(key);
    const k = key as TemplateKey;
    const row = await upsertEmailTemplate({
      key,
      label: body.label ?? TEMPLATE_LABELS[k] ?? key,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText ?? null,
      isActive: body.isActive ?? true,
      variables: TEMPLATE_VARIABLES[k] ?? [],
      updatedBy: auth.userId,
    });

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "email_template",
      entityId: key,
      action: before ? "update" : "create",
      summary: `Email template ${key} ${before ? "updated" : "created"}`,
      before,
      after: row,
    });

    return NextResponse.json(row);
  } catch (err) {
    console.error("[PUT /api/admin/email-templates/[key]]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
