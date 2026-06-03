import { inngest } from "./client";
import { swarmGraph } from "@/lib/swarm/graph";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getPostHogClient } from "@/lib/posthog-server";


export const executeSwarm = inngest.createFunction(
  {
    id: "swarm-execute",
    name: "Execute AI Swarm",
    retries: 3,
    triggers: [{ event: "swarm/execute" }],
    throttle: {
      key: "event.data.userId",
      limit: 3,
      period: "60s",
    },
    priority: {
      run: "event.data.plan == 'PROFESSIONAL' ? 100 : event.data.plan == 'STARTER' ? 50 : 10",
    },
  },
  async ({ event, step }) => {
    const {
      campaignId,
      prospectName,
      prospectUrl,
      brandContext,
      swarmMode,
      userId,
      plan,
    } = event.data as {
      campaignId: string;
      prospectName: string;
      prospectUrl: string;
      brandContext: Record<string, unknown>;
      swarmMode: "fast" | "deep";
      userId: string;
      plan: string;
    };

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

    // Step 1: Execute the swarm graph
    const finalState = await step.run("run-swarm-graph", async () => {
      try {
        return await swarmGraph.invoke(initialState);
      } catch (err) {
        throw new Error(String(err));
      }
    });

    // Step 2: Save results to database
    await step.run("save-results", async () => {
      try {
        const supabase = createSupabaseAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

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
      } catch (err) {
        throw new Error(String(err));
      }
    });

    return {
      campaignId,
      confidenceScore: finalState.confidence_score,
      status: "completed",
    };
  }
);