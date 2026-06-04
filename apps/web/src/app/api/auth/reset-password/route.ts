import { NextRequest, NextResponse } from "next/server";
import { parseAuthActionToken } from "@/lib/auth-action-token";
import { updateCustomerPassword } from "@/lib/customer-auth";
import { publicLoginError } from "@/lib/auth-errors";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = (await req.json()) as {
      token?: string;
      password?: string;
    };

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const payload = await parseAuthActionToken(token, "password_reset");
    if (!payload) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const ok = await updateCustomerPassword(
      payload.sub,
      payload.email,
      password,
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Could not reset password." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json(
      { error: publicLoginError(500) },
      { status: 500 },
    );
  }
}
