import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@icrowd/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cheap readiness probe for PM2 / nginx / uptime monitoring.
// Returns 200 when the Node server + DB are reachable, 503 otherwise.
export async function GET() {
  const startedAt = Date.now();
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json(
      {
        status: "ok",
        uptimeSec: Math.round(process.uptime()),
        dbLatencyMs: Date.now() - startedAt,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        error: err instanceof Error ? err.message : "db unreachable",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export async function HEAD() {
  try {
    await db.execute(sql`select 1`);
    return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
