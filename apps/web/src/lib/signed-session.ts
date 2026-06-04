/** HMAC-signed session tokens shared by admin and customer cookies. */

export function getSessionSecret(): string {
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
    "Set ADMIN_SESSION_SECRET or DATABASE_URL in apps/web/.env for auth sessions.",
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

export async function createSignedSessionToken<T extends { exp: number }>(
  payload: Omit<T, "exp">,
  maxAgeSeconds: number,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const body = { ...payload, exp } as T;
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(body)));
  return `${payloadB64}.${await hmacSign(payloadB64)}`;
}

export async function parseSignedSessionToken<T extends { exp: number }>(
  token: string | undefined | null,
): Promise<T | null> {
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
    ) as T;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
