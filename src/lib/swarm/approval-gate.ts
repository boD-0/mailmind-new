import { SwarmState } from "./graph";
import { createClient } from "@/lib/supabase/server";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";

/**
 * Minimum confidence score required to proceed past the Approval Gate.
 * Configurable via environment variable, defaults to 60.
 */
const APPROVAL_THRESHOLD = (() => {
  const raw = parseInt(process.env.APPROVAL_THRESHOLD ?? "60", 10);
  return isNaN(raw) || raw < 0 || raw > 100 ? 60 : raw;
})();

/**
 * Structured failure reason returned when the swarm doesn't pass the gate.
 */
export interface ApprovalFailure {
  passed: false;
  score: number;
  threshold: number;
  reason: string;
  recommendations: string[];
  failed_components: string[];
}

export interface ApprovalSuccess {
  passed: true;
  score: number;
  threshold: number;
}

export type ApprovalResult = ApprovalSuccess | ApprovalFailure;

/**
 * Evaluates whether the swarm should proceed past the Approval Gate.
 * Checks confidence_score against a configurable threshold and returns
 * a structured result with failure reasons if below threshold.
 */
function evaluateApproval(state: SwarmState): ApprovalResult {
  const { confidence_score, research_data, twin_profile, strategy } = state;

  if (confidence_score >= APPROVAL_THRESHOLD) {
    return {
      passed: true,
      score: confidence_score,
      threshold: APPROVAL_THRESHOLD,
    };
  }

  // Build detailed failure report
  const failed: string[] = [];
  const recommendations: string[] = [];

  if (!research_data || Object.keys(research_data).length === 0) {
    failed.push("Research data is missing or empty");
    recommendations.push("Ensure the Researcher agent completes successfully with valid prospect data.");
  }

  if (!twin_profile || !twin_profile.ocean) {
    failed.push("Digital Twin profile is missing or incomplete");
    recommendations.push("The Psychologist agent needs valid research data to build an OCEAN profile.");
  }

  if (!strategy || Object.keys(strategy).length === 0) {
    failed.push("Strategy is missing or empty");
    recommendations.push("The Strategist agent needs both research data and a twin profile to build a strategy.");
  }

  if (confidence_score < 30) {
    recommendations.push("Consider re-running the swarm with more detailed prospect information.");
  }

  return {
    passed: false,
    score: confidence_score,
    threshold: APPROVAL_THRESHOLD,
    reason: `Confidence score ${confidence_score}% is below the required threshold of ${APPROVAL_THRESHOLD}%.`,
    failed_components: failed,
    recommendations,
  };
}

export async function approvalGate(state: SwarmState) {
  const { campaign_id, confidence_score, research_data, strategy, twin_profile } = state;
  const supabase = await createClient();

  const result = evaluateApproval(state);

  // Save state to DB regardless of outcome
  const { error } = await supabase
    .from("campaigns")
    .update({
      status: result.passed ? "ready_for_copywriter" : "awaiting_approval",
      research_data,
      strategy,
      twin_profile,
      confidence_score,
    })
    .eq("id", campaign_id);

  if (error) {
    console.error("Error updating campaign in Approval Gate:", error);
  }

  if (!result.passed) {
    // Broadcast failure and stop the swarm
    const failureMessage = result.reason + "\n" + result.recommendations.map((r) => `• ${r}`).join("\n");

    await broadcastAgentUpdate(campaign_id, {
      agent: "consensus",
      status: "conflict",
      message: `Approval Gate respins (${confidence_score}% < ${APPROVAL_THRESHOLD}%). ${failureMessage.slice(0, 200)}`,
      timestamp: Date.now(),
    });

    return {
      active_agent: null,
      approval_passed: false,
      approval_result: result,
      trace_log: [
        {
          agent: "approval_gate",
          status: "conflict",
          message: `Approval Gate: FAILED (${confidence_score}% < ${APPROVAL_THRESHOLD}%)`,
          result,
          timestamp: Date.now(),
        },
      ],
    };
  }

  // Success — broadcast and allow continuation
  await broadcastAgentUpdate(campaign_id, {
    agent: "consensus",
    status: "done",
    message: `Approval Gate trecut cu succes (${confidence_score}% ≥ ${APPROVAL_THRESHOLD}%). Pornesc Copywriter-ul.`,
    timestamp: Date.now(),
  });

  return {
    active_agent: "copywriter" as const,
    approval_passed: true,
    approval_result: result,
    trace_log: [
      {
        agent: "approval_gate",
        status: "done",
        message: `Approval Gate: PASSED (${confidence_score}% ≥ ${APPROVAL_THRESHOLD}%)`,
        result,
        timestamp: Date.now(),
      },
    ],
  };
}
