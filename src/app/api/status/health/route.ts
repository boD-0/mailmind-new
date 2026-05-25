import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { redis } from "@/lib/redis";

type ComponentStatus = "operational" | "degraded" | "outage";

interface ComponentHealth {
  name: string;
  key: string;
  status: ComponentStatus;
  latencyMs: number | null;
  error?: string;
}

interface HealthResponse {
  overall: ComponentStatus;
  checkedAt: string;
  components: ComponentHealth[];
}

/**
 * GET /api/status/health
 *
 * Public health check endpoint — no auth required.
 * Verifies connectivity to all critical infrastructure components.
 * Cached for 10 seconds to prevent abuse.
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const start = Date.now();
  const components: ComponentHealth[] = [];

  // ── Database check ──────────────────────────────────────────────
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;

    // Verify a real table exists — but don't fail the whole check if it doesn't
    let tableAccess: ComponentStatus = "operational";
    try {
      await db.execute(sql`SELECT 1 FROM users LIMIT 1`);
    } catch {
      tableAccess = "degraded";
    }

    components.push({
      name: "Database",
      key: "database",
      status: tableAccess,
      latencyMs: dbLatency,
    });
  } catch (err) {
    components.push({
      name: "Database",
      key: "database",
      status: "outage",
      latencyMs: null,
      error: "Database connection failed",
    });
  }

  // ── Redis check ─────────────────────────────────────────────────
  try {
    const redisStart = Date.now();
    await redis.set("health_check", "1", { ex: 15 });
    const value = await redis.get("health_check");
    const redisLatency = Date.now() - redisStart;

    // Verify the value was actually set — the noop mock returns null
    if (value !== "1") {
      throw new Error("Redis read-back mismatch");
    }

    components.push({
      name: "Cache",
      key: "cache",
      status: "operational",
      latencyMs: redisLatency,
    });
  } catch (err) {
    // Redis is non-critical — degraded, not outage
    const isMissing = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;
    components.push({
      name: "Cache",
      key: "cache",
      status: isMissing ? "degraded" : "outage",
      latencyMs: null,
      error: isMissing
        ? "Redis not configured"
        : "Cache connection failed",
    });
  }

  // ── API self-check ──────────────────────────────────────────────
  const apiLatency = Date.now() - start;
  components.push({
    name: "API",
    key: "api",
    status: "operational",
    latencyMs: apiLatency,
  });

  // ── Compute overall status ──────────────────────────────────────
  const hasOutage = components.some((c) => c.status === "outage");
  const hasDegraded = components.some((c) => c.status === "degraded");
  const overall: ComponentStatus = hasOutage
    ? "outage"
    : hasDegraded
      ? "degraded"
      : "operational";

  const response = NextResponse.json<HealthResponse>({
    overall,
    checkedAt: new Date().toISOString(),
    components,
  });

  // Cache for 10 seconds on the edge
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=5"
  );

  return response;
}
