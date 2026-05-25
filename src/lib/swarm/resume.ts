import { swarmGraph } from "./graph";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/drizzle";
import { swarmExecutions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Resumes an interrupted swarm from the last checkpoint.
 *
 * When the Approval Gate pauses execution (awaiting user approval),
 * the swarm state is persisted in the `campaigns` table. This function:
 * 1. Loads the stored campaign state
 * 2. Persists a checkpoint record in `swarm_executions`
 * 3. Re-invokes the LangGraph with the accumulated state
 *    using the `skip_to_copywriter` flag to jump past completed nodes
 *
 * @param campaignId - The campaign to resume
 * @param userId - The authenticated user (for ownership + audit)
 * @returns The final swarm state after completion
 */
export async function resumeSwarmFromCopywriter(
  campaignId: string,
  userId?: string,
) {
  const supabase = await createClient();

  // 1. Load campaign state from the database (our checkpoint)
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  // Verify that the swarm is in a resumable state
  if (campaign.status !== "awaiting_approval" && campaign.status !== "ready_for_copywriter") {
    throw new Error(
      `Campaign ${campaignId} is in status "${campaign.status}" — can only resume from "awaiting_approval" or "ready_for_copywriter".`,
    );
  }

  // 2. Persist a checkpoint record in swarm_executions for audit trail
  const startTime = Date.now();
  let executionId: string | null = null;

  if (userId) {
    try {
      const inserted = await db
        .insert(swarmExecutions)
        .values({
          userId,
          projectId: campaign.project_id ?? undefined,
          agentsUsed: ["RESEARCHER", "STRATEGIST", "ANALYST"] as any,
          inputPrompt: `${campaign.prospect_name} | ${campaign.prospect_url}`,
          outputResult: null,
          modelUsed: "gpt-4o-mini",
          tokensUsed: null,
          durationMs: null,
          status: "pending",
          createdAt: new Date(),
        } as any)
        .returning({ id: swarmExecutions.id });

      if (inserted[0]) {
        executionId = inserted[0].id;
      }
    } catch (dbError) {
      console.error("[resumeSwarm] Failed to insert checkpoint:", dbError);
      // Non-fatal — continue with resume
    }
  }

  // 3. Rehydrate the LangGraph state
  const rehydratedState = {
    campaign_id: campaignId,
    research_data: campaign.research_data ?? {},
    strategy: campaign.strategy ?? {},
    twin_profile: campaign.twin_profile ?? null,
    brand_context: campaign.brand_context ?? {},
    prospect_name: campaign.prospect_name ?? "Prospect",
    prospect_url: campaign.prospect_url ?? "",
    confidence_score: campaign.confidence_score ?? 0,
    swarm_mode: (campaign.swarm_mode ?? "deep") as "fast" | "deep",
    active_agent: "copywriter" as const,
    skip_to_copywriter: true, // Jump past researcher/psychologist/strategist/consensus/approval_gate
    email_draft: null as string | null,
    trace_log: [] as Record<string, unknown>[],
  };

  // 4. Invoke the graph from the loaded state
  // The `skip_to_copywriter` flag causes the graph to jump directly to copywriter
  const finalState = await swarmGraph.invoke(rehydratedState);

  const durationMs = Date.now() - startTime;

  // 5. Update the checkpoint with results (only the specific execution we created)
  if (userId && executionId) {
    try {
      await db
        .update(swarmExecutions)
        .set({
          outputResult: finalState.email_draft ?? null,
          tokensUsed: null,
          durationMs,
          status: finalState.email_draft ? "success" : "error",
        } as any)
        .where(eq(swarmExecutions.id, executionId));
    } catch (dbError) {
      console.error("[resumeSwarm] Failed to update final execution:", dbError);
    }
  }

  // 6. Also update the campaign record in Supabase
  await supabase
    .from("campaigns")
    .update({
      email_draft: finalState.email_draft,
      confidence_score: finalState.confidence_score,
      status: finalState.email_draft ? "completed" : "error",
    })
    .eq("id", campaignId);

  return finalState;
}

/**
 * Retrieve the resume-able state for a campaign (for UI display).
 * Returns null if the campaign is not in a resumable state.
 */
export async function getResumableState(campaignId: string) {
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("id, status, confidence_score, prospect_name, prospect_url, research_data, strategy, twin_profile")
    .eq("id", campaignId)
    .single();

  if (error || !campaign) return null;

  if (campaign.status !== "awaiting_approval" && campaign.status !== "ready_for_copywriter") {
    return null;
  }

  return {
    campaignId: campaign.id,
    status: campaign.status,
    confidenceScore: campaign.confidence_score ?? 0,
    prospectName: campaign.prospect_name,
    prospectUrl: campaign.prospect_url,
    hasResearch: !!campaign.research_data,
    hasStrategy: !!campaign.strategy,
    hasTwin: !!campaign.twin_profile,
  };
}
