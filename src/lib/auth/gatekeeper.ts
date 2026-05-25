import { auth } from "./auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export type Plan = "FREE" | "STARTER" | "PROFESSIONAL";

export interface PlanLimits {
  maxAgents: number;
  maxExecutions: number;  // max swarms per month (-1 = unlimited)
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
    maxExecutions: -1,  // unlimited
    hasVault: true,
    hasWarRoom: true,
    hasDigitalTwin: true,
    aiModel: "gpt-4o",
  },
};

export async function getUserWithPlan(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      console.warn(`[Auth] No session found for request to ${new URL(request.url).pathname}`);
      return null;
    }

    // Use db to get the user with plan to fix unused imports and avoid 'any'
    const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    let user = result[0];

    if (!user) {
      console.warn(`[Auth] Session valid but user not found: ${session.user.id}`);
      return null;
    }

    // ─── Trial expiry check ───────────────────────────────────────────────
    // If the user is on PROFESSIONAL plan and the trial has ended, downgrade to FREE.
    // This only applies to users who activated a trial (have trialEnd set) and haven't
    // upgraded via paid subscription yet. Only runs the UPDATE once (when plan is still PROFESSIONAL).
    const now = new Date();
    let effectivePlan: Plan = (user.plan as Plan) || "FREE";

    if (
      effectivePlan === "PROFESSIONAL" &&
      user.trialEnd &&
      user.trialEnd < now &&
      !user.polarSubscriptionId  // Only downgrade if not a paying subscriber
    ) {
      // Auto-downgrade to FREE after trial expiry.
      // The JS-level guard (effectivePlan check) means this UPDATE runs at most once
      // per expired trial — duplicate updates from concurrent requests are harmless.
      await db
        .update(users)
        .set({ plan: "FREE", updatedAt: now })
        .where(eq(users.id, user.id));
      effectivePlan = "FREE";
      user = { ...user, plan: "FREE" as const, updatedAt: now };
    }

    const trialDaysRemaining = getTrialDaysRemaining(user.trialEnd);

    return {
      ...session.user,
      ...user,
      plan: effectivePlan,
      isTrialing: effectivePlan === "PROFESSIONAL" && !!user.trialEnd && !user.polarSubscriptionId,
      trialDaysRemaining,
    };
  } catch (error) {
    console.error("[Auth] Session error:", error);
    return null;
  }
}

/**
 * Returns how many days remain in the user's trial, or 0 if the trial has ended
 * or was never started. Negative after trial expiry is clamped to 0.
 */
export function getTrialDaysRemaining(trialEnd: Date | null): number {
  if (!trialEnd) return 0;
  return Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export async function requireAuth(request: Request) {
  const user = await getUserWithPlan(request);
  if (!user) {
    const url = new URL(request.url);
    const locale = url.pathname.split('/')[1] || "ro";
    redirect(`/${locale}/login`);
  }
  return user;
}

/**
 * Require auth AND a minimum plan for page-level gating.
 * Redirects to pricing if the user's plan is insufficient.
 */
export async function requirePlanPage(
  request: Request,
  minimumPlan: Plan
) {
  const user = await requireAuth(request);
  const planOrder: Record<Plan, number> = {
    FREE: 0,
    STARTER: 1,
    PROFESSIONAL: 2,
  };
  if ((planOrder[user.plan] ?? 0) < (planOrder[minimumPlan] ?? 0)) {
    const url = new URL(request.url);
    const locale = url.pathname.split('/')[1] || "ro";
    redirect(`/${locale}/pricing`);
  }
  return user;
}

export async function requireOnboarding(request: Request) {
  const user = await requireAuth(request);
  if (!user.onboardingComplete) redirect("/onboarding");
  return user;
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
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

/**
 * Require a minimum plan to access a feature.
 * Returns a 403 NextResponse if the user's plan is insufficient, or null if OK.
 * Usage:
 *   const err = requirePlan(user.plan, "PROFESSIONAL");
 *   if (err) return err;
 */
export function requirePlan(
  userPlan: Plan,
  minimumPlan: Plan
): NextResponse | null {
  const planOrder: Record<Plan, number> = {
    FREE: 0,
    STARTER: 1,
    PROFESSIONAL: 2,
  };
  if ((planOrder[userPlan] ?? 0) < (planOrder[minimumPlan] ?? 0)) {
    return NextResponse.json(
      { error: `This feature requires the ${minimumPlan} plan.` },
      { status: 403 }
    );
  }
  return null;
}

// ─── API Route Auth Helpers ─────────────────────────────────────────────────
// These return NextResponse for use in API routes (instead of redirecting).

/**
 * Require authentication for an API route.
 * Returns the authenticated user, or a 401 NextResponse.
 * Usage:
 *   const user = await apiRequireAuth(request);
 *   if (user instanceof NextResponse) return user;
 *   // user is now safely typed as NonNullable authenticated user
 */
export async function apiRequireAuth(request: Request): Promise<
  | NonNullable<Awaited<ReturnType<typeof getUserWithPlan>>>
  | NextResponse
> {
  const user = await getUserWithPlan(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

/**
 * Verify that a resource belongs to the authenticated user.
 * Returns a 403 NextResponse if ownership check fails, or null if ok.
 * Usage:
 *   const err = verifyOwnership(resourceOwnerId, user.id);
 *   if (err) return err;
 */
export function verifyOwnership(
  resourceOwnerId: string,
  userId: string,
): NextResponse | null {
  if (resourceOwnerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
