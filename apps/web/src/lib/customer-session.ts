import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  createSignedSessionToken,
  parseSignedSessionToken,
  sessionCookieOptions,
} from "@/lib/signed-session";

export const CUSTOMER_SESSION_COOKIE = "icrowd_customer_session";
const SESSION_DAYS = 30;
const MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export type CustomerSessionPayload = {
  sub: string;
  email: string;
  role: "customer";
  exp: number;
};

export async function createCustomerSessionToken(
  payload: Omit<CustomerSessionPayload, "exp">,
): Promise<string> {
  return createSignedSessionToken(payload, MAX_AGE);
}

export async function parseCustomerSessionToken(
  token: string | undefined | null,
): Promise<CustomerSessionPayload | null> {
  const payload = await parseSignedSessionToken<CustomerSessionPayload>(token);
  if (!payload?.sub || !payload.email) return null;
  if (payload.role !== "customer") return null;
  return payload;
}

export function customerSessionCookieOptions(maxAgeSeconds = MAX_AGE) {
  return sessionCookieOptions(maxAgeSeconds);
}

export async function getCustomerSessionFromRequest(
  req: NextRequest,
): Promise<CustomerSessionPayload | null> {
  return parseCustomerSessionToken(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
}

export async function getCustomerSessionFromCookies(): Promise<CustomerSessionPayload | null> {
  const store = await cookies();
  return parseCustomerSessionToken(store.get(CUSTOMER_SESSION_COOKIE)?.value);
}
