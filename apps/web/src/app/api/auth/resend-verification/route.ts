import { NextRequest, NextResponse } from "next/server";
import { getCustomerForEmailActions } from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/auth-emails";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customer = await getCustomerForEmailActions(email.trim());

    if (customer && !customer.emailConfirmed) {
      const sent = await sendVerificationEmail({
        userId: customer.userId,
        email: customer.email,
        fullName: customer.fullName,
      });
      if (!sent.ok) {
        return NextResponse.json(
          { error: "Could not send email. Try again later." },
          { status: 503 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an unverified account exists for this email, we sent a new verification link.",
    });
  } catch (err) {
    console.error("[POST /api/auth/resend-verification]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
