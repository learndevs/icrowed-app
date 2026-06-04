import { NextResponse } from "next/server";
import { getCustomerFromSession } from "@/lib/customer-auth";

export type CustomerContext = {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export async function requireCustomer(): Promise<CustomerContext | NextResponse> {
  const customer = await getCustomerFromSession();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return customer;
}
