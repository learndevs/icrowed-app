import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  customerSessionCookieOptions,
} from "@/lib/customer-session";
import { registerCustomer } from "@/lib/customer-auth";
import { publicLoginError } from "@/lib/auth-errors";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      phone?: string;
    };

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const result = await registerCustomer({
      email: email.trim(),
      password,
      fullName,
      phone,
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const token = await createCustomerSessionToken({
      sub: result.userId,
      email: result.email,
      role: "customer",
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CUSTOMER_SESSION_COOKIE, token, customerSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { error: publicLoginError(500) },
      { status: 500 },
    );
  }
}
