import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  customerSessionCookieOptions,
} from "@/lib/customer-session";
import { verifyCustomerCredentials } from "@/lib/customer-auth";
import { publicLoginError } from "@/lib/auth-errors";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const customer = await verifyCustomerCredentials(email.trim(), password);
    if (!customer) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createCustomerSessionToken({
      sub: customer.userId,
      email: customer.email,
      role: "customer",
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CUSTOMER_SESSION_COOKIE, token, customerSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { error: publicLoginError(500) },
      { status: 500 },
    );
  }
}
