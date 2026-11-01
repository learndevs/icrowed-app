import { NextRequest, NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { db, profiles } from "@icrowd/database";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { publicAdminLoginError } from "@/lib/admin-login-errors";

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

    const [profile] = await db
      .select({ role: profiles.role, isActive: profiles.isActive })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${email.trim().toLowerCase()}`);

    if (
      !profile?.isActive ||
      (profile.role !== "admin" && profile.role !== "operator")
    ) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    try {
      await auth.api.signInEmail({
        body: { email: email.trim().toLowerCase(), password },
        headers: req.headers,
      });
    } catch (err) {
      if (err instanceof APIError) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      throw err;
    }

    return NextResponse.json({ ok: true, role: profile.role });
  } catch (err) {
    console.error("[POST /api/admin/auth/login]", err);
    return NextResponse.json({ error: publicAdminLoginError(500) }, { status: 500 });
  }
}
