import { NextResponse } from "next/server";
import { listEmailTemplates } from "@icrowd/database";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const rows = await listEmailTemplates();
  return NextResponse.json(rows);
}
