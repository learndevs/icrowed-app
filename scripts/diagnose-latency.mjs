#!/usr/bin/env node
/**
 * Measure DB + API latency for icrowd storefront debugging.
 * Usage: node scripts/diagnose-latency.mjs [baseUrl]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  for (const rel of ["apps/web/.env.local", "apps/web/.env"]) {
    try {
      const text = readFileSync(resolve(root, rel), "utf8");
      for (const line of text.split("\n")) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
      console.log(`Loaded env from ${rel}`);
      return;
    } catch {
      /* try next */
    }
  }
}

async function timed(label, fn) {
  const t0 = performance.now();
  try {
    const result = await fn();
    const ms = Math.round(performance.now() - t0);
    console.log(`  ✓ ${label}: ${ms}ms`);
    return { ok: true, ms, result };
  } catch (err) {
    const ms = Math.round(performance.now() - t0);
    console.log(`  ✗ ${label}: ${ms}ms — ${err.message}`);
    return { ok: false, ms, error: err.message };
  }
}

async function testDb(label, connectionString) {
  if (!connectionString) {
    console.log(`\n[${label}] skipped — no connection string`);
    return;
  }
  console.log(`\n[${label}] ${connectionString.replace(/:[^:@/]+@/, ":***@")}`);

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
    max: 1,
  });

  await timed("connect + SELECT 1", async () => {
    const c = await pool.connect();
    try {
      await c.query("SELECT 1");
    } finally {
      c.release();
    }
  });

  await timed("delivery_types (active)", async () => {
    const r = await pool.query(
      `SELECT id, name, price_lkr FROM delivery_types WHERE is_active = true ORDER BY sort_order LIMIT 20`,
    );
    return r.rowCount;
  });

  await timed("shop_shipping_rates", async () => {
    const r = await pool.query(`SELECT * FROM shop_shipping_rates LIMIT 1`);
    return r.rowCount;
  });

  await timed("products count (active)", async () => {
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM products WHERE is_active = true`);
    return r.rows[0].n;
  });

  await timed("products with relations (limit 500)", async () => {
    const r = await pool.query(`
      SELECT p.id, p.name,
        (SELECT json_agg(json_build_object('url', pi.url)) FROM product_images pi WHERE pi.product_id = p.id) AS images
      FROM products p
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT 500
    `);
    return r.rowCount;
  });

  await pool.end();
}

async function testHttp(baseUrl) {
  console.log(`\n[HTTP] ${baseUrl}`);
  for (const path of ["/api/delivery-types", "/api/new-arrivals", "/products"]) {
    await timed(`GET ${path}`, async () => {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
      return text.length;
    });
  }
}

loadEnv();
console.log("=== iCrowd latency diagnostics ===");
console.log(`Host: ${process.env.HOSTNAME || "local"} | ${new Date().toISOString()}`);

await testDb("DATABASE_URL (pooler)", process.env.DATABASE_URL);
await testDb("DIRECT_URL", process.env.DIRECT_URL);

const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
await testHttp(baseUrl);

console.log("\nDone.");
