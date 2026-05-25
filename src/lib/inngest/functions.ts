import { inngest } from "./client";
import { swarmGraph } from "@/lib/swarm/graph";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/drizzle";
import { swarmExecutions } from "@/db/schema";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Inngest function that executes a swarm in the background.
 *
 * This replaces the inline `swarmGraph.invoke()` call in the launch route.
 * Benefits:
 *  - No Vercel 60s timeout (Inngest handles long-running jobs)
 *  - Automatic retry on failure (3 attempts with exponential backoff)
 *  - Priority-based queue per user tier (PROFESSIONAL > STARTER > FREE)
 *  - Observability via Inngest dashboard
 */
export const executeSwarm = inngest.createFunction(
  {
    id: "swarm-execute",
    name: "Execute AI Swarm",
    retries: 3,
    throttle: {
      key: "event.data.userId",
      limit: 3,      // max 3 concurrent swarms per user
      period: "60s",
    },
    // Priority: PROFESSIONAL users get higher priority in the queue
    priority: ({ event }) => {
      const plan = event?.data?.plan;
      if (plan === "PROFESSIONAL") return 100;
      if (plan === "STARTER") return 50;
      return 10;
    },
  },
  { event: "swarm/execute" },
  async ({ event, step }) => {
    const { campaignId, prospectName, prospectUrl, brandContext, swarmMode, userId, plan } = event.data;

    // Step 1: Build initial state
    const initialState = {
      campaign_id: campaignId,
      prospect_name: prospectName || "Prospect",
      prospect_url: prospectUrl || "",
      brand_context: brandContext || {},
      swarm_mode: swarmMode || "deep",
      status: "swarm_running" as const,
      confidence_score: 0,
      active_agent: "researcher" as const,
      trace_log: [] as Array<{ agent: string; timestamp: string; message: string }>,
    };

    // Step 2: Execute the swarm graph
    const finalState = await step.run("run-swarm-graph", async () => {
      return await swarmGraph.invoke(initialState);
    });

    // Step 3: Save results to database
    await step.run("save-results", async () => {
      const supabase = await createClient();
      await supabase
        .from("campaigns")
        .update({
          research_data: finalState.research_data,
          twin_profile: finalState.twin_profile,
          strategy: finalState.strategy,
          email_draft: finalState.email_draft,
          confidence_score: finalState.confidence_score,
          status: "consensus_reached",
        })
        .eq("id", campaignId);

      // Track completion
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "swarm_completed",
        properties: {
          campaign_id: campaignId,
          confidence_score: finalState.confidence_score,
          plan,
        },
      });
    });

    return {
      campaignId,
      confidenceScore: finalState.confidence_score,
      status: "completed",
    };
  }
);
