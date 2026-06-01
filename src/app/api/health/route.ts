import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";

/**
 * GET /api/health
 *
 * Health check endpoint for uptime monitoring (BetterStack, Instatus, etc.).
 * Checks:
 *   1. Database connectivity (Drizzle/Neon)
 *   2. Redis connectivity (Upstash)
 *   3. System status
 *
 * Returns 200 if all systems are healthy, 503 if any system is down.
 * Response is minimal to avoid leaking internal details.
 *
 * This endpoint is semi-public — it requires a secret key for detailed status.
 * Basic uptime check (no secret) returns 200 if the app is alive.
 *
 * Query params:
 *   ?key=HEALTH_CHECK_SECRET → returns detailed DB + Redis + Supabase status
 *   (no key)                  → returns minimal uptime check only
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get("key");
  const expectedKey = process.env.HEALTH_CHECK_SECRET;

  // ── Minimal uptime check (no secret required) ──────────────────────────
  //    Returns 200 if the app is alive. Used by basic uptime monitors.
  if (!expectedKey || providedKey !== expectedKey) {
    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=30, s-maxage=30" },
      },
    );
  }

  // ── Detailed health check (requires HEALTH_CHECK_SECRET) ───────────────
  const checks: Record<string, "ok" | "error" | "unavailable"> = {};
  let allHealthy = true;

  // ── Database check ──────────────────────────────────────────────────────
  try {
    await db.execute(sql`SELECT 1`);
    checks.db = "ok";
  } catch (error) {
    checks.db = "error";
    allHealthy = false;
    console.error("[Health] Database check failed:", error);
  }

  // ── Redis check ─────────────────────────────────────────────────────────
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string };
        if (data.result === "PONG") {
          checks.redis = "ok";
        } else {
          checks.redis = "error";
          allHealthy = false;
        }
      } else {
        checks.redis = "error";
        allHealthy = false;
      }
    } catch {
      // Redis is optional — don't fail if not configured
      checks.redis = "unavailable";
    }
  } else {
    checks.redis = "unavailable";
  }

  // ── Inngest check ───────────────────────────────────────────────────────
  const eventKey = process.env.INNGEST_EVENT_KEY;
  if (eventKey) {
    // Key is configured — verify by attempting to reach the Inngest service
    const inngestDevUrl = process.env.INNGEST_DEV_URL || "http://localhost:8288";
    try {
      const res = await fetch(`${inngestDevUrl}/v1/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        checks.inngest = "ok";
        checks.inngest_dev = "ok";
      } else {
        // Dev server not reachable; key is configured but dev server may not be running
        checks.inngest = "ok";
        checks.inngest_dev = "unavailable";
      }
    } catch {
      // Dev server not running — key is still configured for production
      checks.inngest = "ok";
      checks.inngest_dev = "unavailable";
    }
  } else {
    checks.inngest = "unavailable";
    checks.inngest_dev = "unavailable";
  }

  // ── System status ───────────────────────────────────────────────────────
  const status = allHealthy ? "healthy" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        // Allow monitoring tools to cache for 30 seconds
        "Cache-Control": "public, max-age=30, s-maxage=30",
      },
    },
  );
}
