"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { users, swarmExecutions, apiUsageDaily, vaultDocuments } from "@/db/schema";
import { count, sql, sum } from "drizzle-orm";

/**
 * Get real-time admin statistics from the database.
 * Only callable by the founder (email check).
 */
export async function getAdminStats(): Promise<{
  totalSwarms: number;
  activeUsers: number;
  totalDocuments: number;
  totalTokensUsed: number;
  formattedTokens: string;
  systemHealth: string;
  recentExecutions: Array<{
    id: string;
    status: string;
    modelUsed: string | null;
    tokensUsed: number | null;
    createdAt: string;
  }>;
} | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) return null;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return null;
    if (
      session.user.email.toLowerCase() !== adminEmail.toLowerCase()
    ) {
      return null;
    }

    // Aggregate stats in parallel
    const [swarmCount, userCount, docCount, tokenTotal, recentExecs] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(swarmExecutions)
          .then((r) => r[0]?.count ?? 0),
        db
          .select({ count: count() })
          .from(users)
          .then((r) => r[0]?.count ?? 0),
        db
          .select({ count: count() })
          .from(vaultDocuments)
          .then((r) => r[0]?.count ?? 0),
        db
          .select({ total: sum(apiUsageDaily.totalTokens) })
          .from(apiUsageDaily)
          .then((r) => Number(r[0]?.total ?? 0)),
        db
          .select({
            id: swarmExecutions.id,
            status: swarmExecutions.status,
            modelUsed: swarmExecutions.modelUsed,
            tokensUsed: swarmExecutions.tokensUsed,
            createdAt: swarmExecutions.createdAt,
          })
          .from(swarmExecutions)
          .orderBy(sql`${swarmExecutions.createdAt} DESC`)
          .limit(10),
      ]);

    const formattedTokens =
      tokenTotal >= 1_000_000
        ? `${(tokenTotal / 1_000_000).toFixed(1)}M`
        : tokenTotal >= 1_000
          ? `${(tokenTotal / 1_000).toFixed(1)}K`
          : String(tokenTotal);

    return {
      totalSwarms: swarmCount,
      activeUsers: userCount,
      totalDocuments: docCount,
      totalTokensUsed: tokenTotal,
      formattedTokens,
      systemHealth: "Operational",
      recentExecutions: recentExecs.map((e) => ({
        id: e.id,
        status: e.status,
        modelUsed: e.modelUsed,
        tokensUsed: e.tokensUsed,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[Admin] Stats query error:", error);
    return null;
  }
}
