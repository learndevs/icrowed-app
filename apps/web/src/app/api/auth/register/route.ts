import { NextRequest, NextResponse } from "next/server";
import { registerCustomer } from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/auth-emails";
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

    const sent = await sendVerificationEmail({
      userId: result.userId,
      email: result.email,
      fullName: result.fullName,
    });

    if (!sent.ok) {
      console.error("[POST /api/auth/register] verification email:", sent.error);
      return NextResponse.json(
        {
          error:
            "Account created but we could not send the verification email. Use resend on the login page.",
          code: "EMAIL_SEND_FAILED",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      needsVerification: true,
      email: result.email,
      resent: result.alreadyPending === true,
    });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { error: publicLoginError(500) },
      { status: 500 },
    );
  }
}
