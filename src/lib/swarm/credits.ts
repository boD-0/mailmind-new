import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Gets the user's current swarm credit balance.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ credits: users.swarmCredits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.credits ?? 0;
}

/**
 * Attempts to consume one swarm credit from the user's balance.
 * Uses an atomic UPDATE … WHERE swarm_credits > 0 to prevent double-spend.
 *
 * Returns true if a credit was consumed, false if balance was 0.
 */
export async function consumeCredit(userId: string): Promise<boolean> {
  const [result] = await db
    .update(users)
    .set({
      swarmCredits: sql`swarm_credits - 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), sql`swarm_credits > 0`))
    .returning({ remaining: users.swarmCredits });

  return result ? true : false;
}

/**
 * Adds credits to a user's balance (called by webhook after successful payment).
 */
export async function addCredits(userId: string, amount: number): Promise<number> {
  const [result] = await db
    .update(users)
    .set({
      swarmCredits: sql`swarm_credits + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ newBalance: users.swarmCredits });

  return result?.newBalance ?? 0;
}
