import { NextResponse } from 'next/server'
import { swarmGraph } from '@/lib/swarm/graph'
import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { apiRequireAuth, verifyOwnership, PLAN_LIMITS, type Plan } from "@/lib/auth/gatekeeper";
import { tieredAiRateLimit } from "@/lib/rate-limit";
import { getMonthlyExecutionCount } from "@/lib/swarm/usage";
import { db } from "@/db/drizzle";
import { swarmExecutions } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { consumeCredit } from "@/lib/swarm/credits";
import { inngest } from "@/lib/inngest/client";
import { swarmLaunchSchema, validateBody } from "@/lib/validate";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp } from "@/lib/get-client-ip";

export async function POST(request: Request) {
  // Require authentication via better-auth
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  // Tiered rate limit: FREE=3/min, STARTER=10/min, PROFESSIONAL=30/min
  const rateLimitResult = await tieredAiRateLimit(user.plan, user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Swarm generation limit reached. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      },
    );
  }

  // ─── Monthly execution limit check ────────────────────────────────────────
  // NOTE: There's a minor TOCTOU race condition here — two concurrent requests
  // could both pass the limit check before either inserts. This is acceptable
  // for a soft pricing limit (not a security boundary).
  const plan = (user as { plan?: Plan }).plan || "FREE";
  const maxExecutions = PLAN_LIMITS[plan].maxExecutions;

  if (maxExecutions !== -1) {
    const usedThisMonth = await getMonthlyExecutionCount(user.id);
    if (usedThisMonth >= maxExecutions) {
      // Plan limit reached — try consuming a swarm credit
      const creditUsed = await consumeCredit(user.id);
      if (!creditUsed) {
        return NextResponse.json(
          {
            error: `Monthly execution limit reached. You've used ${usedThisMonth}/${maxExecutions} swarms this month. Buy extra credits or upgrade to unlock more.`,
            code: "MONTHLY_LIMIT",
          },
          { status: 429 },
        );
      }
      // Track credit usage for funnel analysis
      getPostHogClient().capture({
        distinctId: user.id,
        event: "credit_consumed",
        properties: {
          monthly_usage: usedThisMonth,
          monthly_limit: maxExecutions,
        },
      });
    }
  }

  try {
    const text = await request.text();
    const body = JSON.parse(text || "{}");

    // Zod validation
    const parsed = validateBody(swarmLaunchSchema, body);
    if (parsed instanceof NextResponse) return parsed;
    const { campaignId } = parsed;
    
    const supabase = await createClient()
    
    // Preluăm datele campaniei
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Verify ownership: the authenticated user must own this campaign
    const ownershipError = verifyOwnership(campaign.user_id, user.id);
    if (ownershipError) return ownershipError;

    // Preluăm datele de onboarding și subscripție
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_data, subscription_plan')
      .eq('id', campaign.user_id)
      .single()

    const swarm_mode = (profile?.subscription_plan === 'fast_scan' ? 'fast' : 'deep') as 'fast' | 'deep'

    // Send swarm execution to Inngest queue (background, retryable, no Vercel timeout)
    // Falls back to inline execution when INNGEST_EVENT_KEY is not set.
    if (process.env.INNGEST_EVENT_KEY) {
      await inngest.send({
        name: "swarm/execute",
        data: {
          campaignId,
          prospectName: campaign.prospect_name || "Prospect",
          prospectUrl: campaign.prospect_url || "",
          brandContext: profile?.onboarding_data || {},
          swarmMode: swarm_mode,
          userId: user.id,
          plan: plan,
        },
      });
    } else {
      // Fallback: inline async execution (may hit Vercel 60s timeout on large swarms)
      const initialState = {
        campaign_id: campaignId,
        prospect_name: campaign.prospect_name || "Prospect",
        prospect_url: campaign.prospect_url || "",
        brand_context: profile?.onboarding_data || {},
        swarm_mode,
        status: 'swarm_running' as const,
        confidence_score: 0,
        active_agent: 'researcher' as const,
        trace_log: []
      };

      swarmGraph.invoke(initialState).then(async (finalState) => {
        await supabase
          .from('campaigns')
          .update({
            research_data: finalState.research_data,
            twin_profile: finalState.twin_profile,
            strategy: finalState.strategy,
            email_draft: finalState.email_draft,
            confidence_score: finalState.confidence_score,
            status: 'consensus_reached'
          })
          .eq('id', campaignId)
      });
    }

    const posthog = getPostHogClient()

    // Check if this is the user's first swarm (for funnel analysis)
    const [countRow] = await db
      .select({ total: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(swarmExecutions)
      .where(eq(swarmExecutions.userId, user.id));
    const isFirstSwarm = (countRow?.total ?? 0) === 0;

    posthog.capture({
      distinctId: user.id,
      event: 'swarm_launched',
      properties: {
        campaign_id: campaignId,
        swarm_mode,
        prospect_name: campaign.prospect_name || null,
        is_first: isFirstSwarm,
      },
    })

    // Audit log
    logAuditEvent({
      userId: user.id,
      action: 'swarm.launch',
      resourceType: 'campaign',
      resourceId: campaignId,
      metadata: { swarm_mode, plan },
      ipAddress: getClientIp(request),
    }).catch(() => {});

    return NextResponse.json({ message: 'Swarm launched', status: 'running' })
  } catch (error) {
    console.error("Launch error:", error)
    return NextResponse.json({ error: 'Failed to launch swarm' }, { status: 500 })
  }
}
