import "server-only";

import {
  createSignedSessionToken,
  parseSignedSessionToken,
} from "@/lib/signed-session";

export type AuthActionPurpose = "email_verify" | "password_reset";

export type AuthActionPayload = {
  sub: string;
  email: string;
  purpose: AuthActionPurpose;
  exp: number;
};

const VERIFY_MAX_AGE = 24 * 60 * 60;
const RESET_MAX_AGE = 60 * 60;

export async function createAuthActionToken(
  payload: Omit<AuthActionPayload, "exp">,
): Promise<string> {
  const maxAge =
    payload.purpose === "email_verify" ? VERIFY_MAX_AGE : RESET_MAX_AGE;
  return createSignedSessionToken(payload, maxAge);
}

export async function parseAuthActionToken(
  token: string | null | undefined,
  expectedPurpose: AuthActionPurpose,
): Promise<AuthActionPayload | null> {
  const payload = await parseSignedSessionToken<AuthActionPayload>(token);
  if (!payload?.sub || !payload.email) return null;
  if (payload.purpose !== expectedPurpose) return null;
  return payload;
}
