import { NextResponse } from "next/server";
import { getStaffFromSession } from "@/lib/admin-auth";

export type AdminContext = {
  userId: string;
  email: string;
  role: "admin" | "operator" | "customer";
};

/**
 * Call at the top of any admin-only API route handler.
 * Returns `{ userId, email, role }` on success, or a NextResponse (401/403) to return immediately.
 */
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const staff = await getStaffFromSession();

  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (staff.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId: staff.userId, email: staff.email, role: staff.role };
}

/**
 * Same as requireAdmin but allows admin OR operator.
 */
export async function requireStaff(): Promise<AdminContext | NextResponse> {
  const staff = await getStaffFromSession();

  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { userId: staff.userId, email: staff.email, role: staff.role };
}
