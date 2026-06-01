"use server";

import { headers } from "next/headers";
import { requireAuth, type Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import { getMonthlyExecutionCount } from "@/lib/swarm/usage";

export type SwarmUsage = {
  used: number;
  maxExecutions: number;  // -1 = unlimited (matching PLAN_LIMITS convention)
  isUnlimited: boolean;
  remaining: number;      // -1 = unlimited
  percentage: number;     // 0–100 (0 if unlimited)
  planLabel: string;
};

/**
 * Fetch how many swarms the current user has executed this calendar month
 * and compare against their plan's maxExecutions limit.
 */
export async function getSwarmUsage(): Promise<SwarmUsage> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  const plan: Plan = (user as { plan?: Plan }).plan || "FREE";
  const { maxExecutions } = PLAN_LIMITS[plan];

  const used = await getMonthlyExecutionCount(user.id);
  const isUnlimited = maxExecutions === -1;
  const remaining = isUnlimited ? -1 : Math.max(0, maxExecutions - used);
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / maxExecutions) * 100));

  return {
    used,
    maxExecutions,
    isUnlimited,
    remaining,
    percentage,
    planLabel: plan,
  };
}
