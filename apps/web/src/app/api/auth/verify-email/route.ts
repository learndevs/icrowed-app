import { NextRequest, NextResponse } from "next/server";
import { parseAuthActionToken } from "@/lib/auth-action-token";
import { confirmCustomerEmail } from "@/lib/customer-auth";

function redirectUrl(req: NextRequest, path: string): URL {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  return new URL(path, base);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const payload = await parseAuthActionToken(token, "email_verify");

  if (!payload) {
    return NextResponse.redirect(
      redirectUrl(req, "/login?error=invalid_verify_token"),
    );
  }

  const ok = await confirmCustomerEmail(payload.sub, payload.email);
  if (!ok) {
    return NextResponse.redirect(
      redirectUrl(req, "/login?error=verify_failed"),
    );
  }

  return NextResponse.redirect(
    redirectUrl(req, "/login?verified=1"),
  );
}
