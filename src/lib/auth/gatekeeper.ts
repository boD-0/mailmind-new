import { auth } from "./auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
    if (!session) return null;

    // Use db to get the user with plan to fix unused imports and avoid 'any'
    const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const user = result[0];

    if (!user) return null;

    return {
      ...session.user,
      ...user,
      plan: user.plan as Plan || "FREE",
    };
  } catch (error) {
    console.error("Auth session error:", error);
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
