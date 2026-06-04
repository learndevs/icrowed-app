import { NextRequest, NextResponse } from "next/server";
import { getCustomerForEmailActions } from "@/lib/customer-auth";
import { sendPasswordResetEmail } from "@/lib/auth-emails";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customer = await getCustomerForEmailActions(email.trim());

    if (customer?.emailConfirmed) {
      const sent = await sendPasswordResetEmail({
        userId: customer.userId,
        email: customer.email,
      });
      if (!sent.ok) {
        console.error("[forgot-password] send failed:", sent.error);
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for this email, we sent password reset instructions.",
    });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
