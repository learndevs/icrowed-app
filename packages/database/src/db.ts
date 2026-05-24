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
  // Tight timeouts so a stalled DB never hangs a Node request thread for long.
  connectionTimeoutMillis: 5_000,
  // Supabase pooler aggressively closes idle TCP — recycle ours first to avoid
  // EHOSTUNREACH / Connection terminated unexpectedly on the next query.
  idleTimeoutMillis: 30_000,
  // Detect dead TCP (NAT/load balancer drops) before the request observes it.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  // Cap so we never blow Supabase's per-project connection limit. Set
  // DATABASE_POOL_MAX explicitly when running multiple PM2 instances.
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  allowExitOnIdle: false,
});

// Surface pool errors instead of crashing the Node process — PM2 would otherwise
// rapid-restart on every transient Supabase blip.
pool.on("error", (err) => {
  console.error("[pg.Pool] idle client error", err);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
