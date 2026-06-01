import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { apiUsageDaily, users } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

// Model pricing per 1K tokens (GPT-4o: $2.50/1M input, $10/1M output → ~$0.006/1K avg)
// GPT-4o-mini: $0.15/1M input, $0.60/1M output → ~$0.0004/1K avg
// Swarm execution uses ~4 agents, average ~8K tokens total → ~$0.05-$0.15/execution
const AVG_COST_PER_1K_TOKENS = 0.006; // blended rate

interface DailyCostRow {
  userId: string;
  plan: "FREE" | "STARTER" | "PROFESSIONAL";
  totalTokens: number;
  estimatedCost: number;
}

/**
 * GET /api/admin/cost-monitoring — Daily cost aggregation report
 * 
 * Publicly accessible (cost data only, no PII).
 * Intended to be called by a cron job (e.g., Vercel Cron, GitHub Actions).
 * 
 * Query: GET /api/admin/cost-monitoring?key=<CRON_SECRET_KEY>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // Simple shared secret for cron authentication
  if (!key || key !== process.env.CRON_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Aggregate token usage by user for today
    const rows = await db
      .select({
        userId: apiUsageDaily.userId,
        plan: users.plan,
        totalTokens: sql<number>`COALESCE(SUM(${apiUsageDaily.totalTokens}), 0)::int`,
      })
      .from(apiUsageDaily)
      .innerJoin(users, eq(apiUsageDaily.userId, users.id))
      .where(
        and(
          eq(apiUsageDaily.date, sql`CURRENT_DATE`),
        )
      )
      .groupBy(apiUsageDaily.userId, users.plan);

    const dailyCosts: DailyCostRow[] = rows.map((row) => ({
      userId: row.userId,
      plan: row.plan as "FREE" | "STARTER" | "PROFESSIONAL",
      totalTokens: row.totalTokens,
      estimatedCost: Math.round(row.totalTokens * AVG_COST_PER_1K_TOKENS * 10000) / 10000,
    }));

    const totals = {
      totalUsers: dailyCosts.length,
      totalTokensToday: dailyCosts.reduce((sum, r) => sum + r.totalTokens, 0),
      totalCostToday: Math.round(dailyCosts.reduce((sum, r) => sum + r.estimatedCost, 0) * 10000) / 10000,
      perPlan: {
        FREE: {
          count: dailyCosts.filter((r) => r.plan === "FREE").length,
          tokens: dailyCosts.filter((r) => r.plan === "FREE").reduce((s, r) => s + r.totalTokens, 0),
          cost: Math.round(dailyCosts.filter((r) => r.plan === "FREE").reduce((s, r) => s + r.estimatedCost, 0) * 10000) / 10000,
        },
        STARTER: {
          count: dailyCosts.filter((r) => r.plan === "STARTER").length,
          tokens: dailyCosts.filter((r) => r.plan === "STARTER").reduce((s, r) => s + r.totalTokens, 0),
          cost: Math.round(dailyCosts.filter((r) => r.plan === "STARTER").reduce((s, r) => s + r.estimatedCost, 0) * 10000) / 10000,
        },
        PROFESSIONAL: {
          count: dailyCosts.filter((r) => r.plan === "PROFESSIONAL").length,
          tokens: dailyCosts.filter((r) => r.plan === "PROFESSIONAL").reduce((s, r) => s + r.totalTokens, 0),
          cost: Math.round(dailyCosts.filter((r) => r.plan === "PROFESSIONAL").reduce((s, r) => s + r.estimatedCost, 0) * 10000) / 10000,
        },
      },
      topUsers: dailyCosts
        .sort((a, b) => b.estimatedCost - a.estimatedCost)
        .slice(0, 10)
        .map((r) => ({
          userId: r.userId.slice(0, 8) + "…",
          plan: r.plan,
          tokens: r.totalTokens,
          cost: r.estimatedCost,
        })),
    };

    return NextResponse.json({ timestamp: new Date().toISOString(), totals });
  } catch (error) {
    console.error("[CostMonitor] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
