// ─── Shared Plan Types & Constants ───────────────────────────────────────────
// This file is intentionally free of auth imports so that client components
// can import Plan types without pulling in @better-auth/infra → @better-auth/sso → fs.

export type Plan = "FREE" | "STARTER" | "PROFESSIONAL";

export interface PlanLimits {
  maxAgents: number;
  maxExecutions: number; // max swarms per month (-1 = unlimited)
  hasVault: boolean;
  hasWarRoom: boolean;
  hasDigitalTwin: boolean;
  aiModel: "gpt-4o-mini" | "gpt-4o";
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxAgents: 1,
    maxExecutions: 3,
    hasVault: false,
    hasWarRoom: false,
    hasDigitalTwin: false,
    aiModel: "gpt-4o-mini",
  },
  STARTER: {
    maxAgents: 2,
    maxExecutions: 30,
    hasVault: true,
    hasWarRoom: false,
    hasDigitalTwin: false,
    aiModel: "gpt-4o",
  },
  PROFESSIONAL: {
    maxAgents: 4,
    maxExecutions: -1, // unlimited
    hasVault: true,
    hasWarRoom: true,
    hasDigitalTwin: true,
    aiModel: "gpt-4o",
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}

export function checkFeatureAccess(
  plan: Plan,
  feature: keyof Omit<PlanLimits, "maxAgents" | "maxExecutions" | "aiModel">
): boolean {
  return PLAN_LIMITS[plan][feature];
}

/**
 * Alias for checkFeatureAccess — cleaner API for UI components.
 * Usage: canAccess(userPlan, "hasWarRoom")
 */
export const canAccess = checkFeatureAccess;
