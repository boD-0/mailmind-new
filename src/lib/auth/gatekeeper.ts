import { auth } from "./auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export type Plan = "FREE" | "STARTER" | "PROFESSIONAL";

export interface PlanLimits {
  maxAgents: number;
  hasVault: boolean;
  hasWarRoom: boolean;
  hasDigitalTwin: boolean;
  aiModel: "gpt-4o-mini" | "gpt-4o";
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxAgents: 1,
    hasVault: false,
    hasWarRoom: false,
    hasDigitalTwin: false,
    aiModel: "gpt-4o-mini",
  },
  STARTER: {
    maxAgents: 2,
    hasVault: true,
    hasWarRoom: false,
    hasDigitalTwin: false,
    aiModel: "gpt-4o",
  },
  PROFESSIONAL: {
    maxAgents: 4,
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
    const user = result[0];

    if (!user) {
      console.warn(`[Auth] Session valid but user not found: ${session.user.id}`);
      return null;
    }

    return {
      ...session.user,
      ...user,
      plan: user.plan as Plan || "FREE",
    };
  } catch (error) {
    console.error("[Auth] Session error:", error);
    return null;
  }
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
  feature: keyof Omit<PlanLimits, "maxAgents" | "aiModel">
): boolean {
  return PLAN_LIMITS[plan][feature];
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
