import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

/**
 * Forcing TLS on every connection breaks typical local Postgres (no SSL).
 * Supabase / managed hosts need relaxed TLS verification.
 */
function sslForConnectionString(connectionString: string): PoolConfig["ssl"] {
  const s = connectionString.trim().toLowerCase();
  if (s.includes("sslmode=disable")) return false;
  const localHost =
    /(^|@)localhost([/:?]|$)/i.test(s) ||
    /(^|@)127\.0\.0\.1([/:?]|$)/i.test(s) ||
    /(^|@)\[::1\]([:/?]|$)/i.test(s);
  if (localHost) return false;
  return { rejectUnauthorized: false };
}

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add a Postgres URL to apps/web/.env.local (same file as your Supabase keys).",
  );
}

/**
 * Supabase session pooler (:5432) caps concurrent clients at ~15 (EMAXCONNSESSION).
 * Use transaction pooler (:6543?pgbouncer=true) for the app; keep :5432 for migrations only.
 * min: 1 + keepAlive avoids ~1s cold-connect penalty on VPS (US → Singapore).
 */
const pool = new Pool({
  connectionString,
  ssl: sslForConnectionString(connectionString),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 20_000),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 60_000),
  max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  min: Number(process.env.DATABASE_POOL_MIN ?? 1),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

// Warm pool on startup so the first checkout/API request is not blocked on TLS handshake.
void pool.query("SELECT 1").catch(() => {});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
