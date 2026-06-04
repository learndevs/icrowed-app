import { NextResponse } from "next/server";
import { getCustomerFromSession } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCustomerFromSession();
  if (!customer) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: customer.userId,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
    },
  });
}
