import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "icrowd_admin_session";
const SESSION_DAYS = 7;

export type AdminSessionPayload = {
  sub: string;
  email: string;
  role: "admin" | "operator";
  exp: number;
};

/** Stable signing key: explicit env, else derived from DATABASE_URL (VPS-friendly). */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;

  const db = process.env.DATABASE_URL?.trim() ?? "";
  if (db.length >= 20) {
    let h = 2166136261;
    for (let i = 0; i < db.length; i++) {
      h ^= db.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `icrowd-admin-${(h >>> 0).toString(16)}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "icrowd-dev-admin-session";
  }

  throw new Error(
    "Set ADMIN_SESSION_SECRET or DATABASE_URL in apps/web/.env for admin login.",
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(payloadB64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminSessionToken(
  payload: Omit<AdminSessionPayload, "exp">,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const body: AdminSessionPayload = { ...payload, exp };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(body)));
  return `${payloadB64}.${await hmacSign(payloadB64)}`;
}

export async function parseAdminSessionToken(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const expected = await hmacSign(payloadB64);
    if (!timingSafeEqual(sig, expected)) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64)),
    ) as AdminSessionPayload;
    if (!payload.sub || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "admin" && payload.role !== "operator") return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
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
