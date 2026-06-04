import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  customerSessionCookieOptions,
} from "@/lib/customer-session";
import { authenticateCustomer } from "@/lib/customer-auth";
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

    const auth = await authenticateCustomer(email.trim(), password);
    if (!auth) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (auth.status === "unverified") {
      return NextResponse.json(
        {
          error: "Please verify your email before signing in.",
          code: "EMAIL_NOT_VERIFIED",
          email: auth.email,
        },
        { status: 403 },
      );
    }

    const token = await createCustomerSessionToken({
      sub: auth.userId,
      email: auth.email,
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
