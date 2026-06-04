import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  createSignedSessionToken,
  parseSignedSessionToken,
  sessionCookieOptions,
} from "@/lib/signed-session";

export const ADMIN_SESSION_COOKIE = "icrowd_admin_session";
const SESSION_DAYS = 7;
const MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export type AdminSessionPayload = {
  sub: string;
  email: string;
  role: "admin" | "operator";
  exp: number;
};

export async function createAdminSessionToken(
  payload: Omit<AdminSessionPayload, "exp">,
): Promise<string> {
  return createSignedSessionToken(payload, MAX_AGE);
}

export async function parseAdminSessionToken(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  const payload = await parseSignedSessionToken<AdminSessionPayload>(token);
  if (!payload?.sub || !payload.email) return null;
  if (payload.role !== "admin" && payload.role !== "operator") return null;
  return payload;
}

export function adminSessionCookieOptions(maxAgeSeconds = MAX_AGE) {
  return sessionCookieOptions(maxAgeSeconds);
}

export async function getAdminSessionFromRequest(
  req: NextRequest,
): Promise<AdminSessionPayload | null> {
  return parseAdminSessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  return parseAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}
