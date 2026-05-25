import { db } from "@/db/drizzle";
import { swarmExecutions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * Count how many swarm executions a user has launched in the current calendar month (UTC).
 * Used by both the usage action and the launch rate limiter.
 */
export async function getMonthlyExecutionCount(userId: string): Promise<number> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [row] = await db
    .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(swarmExecutions)
    .where(
      and(
        eq(swarmExecutions.userId, userId),
        gte(swarmExecutions.createdAt, monthStart),
      )
    );

  return row?.count ?? 0;
}
