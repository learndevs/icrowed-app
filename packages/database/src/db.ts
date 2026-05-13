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

const pool = new Pool({
  connectionString,
  ssl: sslForConnectionString(connectionString),
  connectionTimeoutMillis: 15_000,
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
