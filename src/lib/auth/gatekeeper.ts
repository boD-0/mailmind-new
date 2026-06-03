import { auth } from "./auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { Plan, PlanLimits } from "./plans";

export type { Plan, PlanLimits } from "./plans";
export { PLAN_LIMITS, getPlanLimits, checkFeatureAccess, canAccess } from "./plans";

/**
 * Extrage limba (locale) în siguranță, fie din request, fie din headerele Next.js
 */
async function getSafeLocale(request?: Request): Promise<{ locale: string; pathname: string }> {
  try {
    if (request && request.url && request.url !== "undefined") {
      const url = new URL(request.url);
      const locale = url.pathname.split('/')[1] || "ro";
      return { locale, pathname: url.pathname };
    }
  } catch (e) {
    // Dacă URL-ul a fost malformat, cădem pe fallback-ul de headers
  }

  // Fallback pentru Server Actions / Server Components unde request-ul e absent sau invalid
  const headersList = await headers();
  const nextUrl = headersList.get("next-url") || ""; // Header injectat automat de Next.js
  const locale = nextUrl.split('/')[1] || "ro";
  return { locale, pathname: nextUrl };
}

export async function getUserWithPlan(request?: Request) {
  try {
    // Construim headerele în siguranță
    let requestHeaders: Headers;
    if (request?.headers) {
      requestHeaders = request.headers;
    } else {
      const nextHeaders = await headers();
      requestHeaders = new Headers(nextHeaders);
    }

    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) {
      const { pathname } = await getSafeLocale(request);
      console.warn(`[Auth] No session found for request to ${pathname || "unknown path"}`);
      return null;
    }

    const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    let user = result[0];

    if (!user) {
      console.warn(`[Auth] Session valid but user not found: ${session.user.id}`);
      return null;
    }

    // ─── Trial expiry check ───────────────────────────────────────────────
    const now = new Date();
    let effectivePlan: Plan = (user.plan as Plan) || "FREE";

    if (
      effectivePlan === "PROFESSIONAL" &&
      user.trialEnd &&
      user.trialEnd < now &&
      !user.polarSubscriptionId
    ) {
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

export function getTrialDaysRemaining(trialEnd: Date | null): number {
  if (!trialEnd) return 0;
  return Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export async function requireAuth(request?: Request) {
  const user = await getUserWithPlan(request);
  if (!user) {
    const { locale } = await getSafeLocale(request);
    redirect(`/${locale}/login`);
  }
  return user;
}

export async function requirePlanPage(
  minimumPlan: Plan,
  request?: Request
) {
  const user = await requireAuth(request);
  const planOrder: Record<Plan, number> = {
    FREE: 0,
    STARTER: 1,
    PROFESSIONAL: 2,
  };
  
  if ((planOrder[user.plan] ?? 0) < (planOrder[minimumPlan] ?? 0)) {
    const { locale } = await getSafeLocale(request);
    redirect(`/${locale}/pricing`);
  }
  return user;
}

export async function requireOnboarding(request?: Request) {
  const user = await requireAuth(request);
  if (!user.onboardingComplete) {
    const { locale } = await getSafeLocale(request);
    redirect(`/${locale}/onboarding`);
  }
  return user;
}

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

export function verifyOwnership(
  resourceOwnerId: string,
  userId: string,
): NextResponse | null {
  if (resourceOwnerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}