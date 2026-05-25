import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { AgentName } from "@/types/swarm";
import { DigitalTwin } from "@/types/twin";
import { researcherAgent } from "./agents/researcher";
import { psychologistAgent } from "./agents/psychologist";
import { strategistAgent } from "./agents/strategist";
import { copywriterAgent } from "./agents/copywriter";
import { consensusAgent } from "./consensus";
import { approvalGate, ApprovalResult } from "./approval-gate";
import { simulateReaction } from "./sandbox";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";

export const SwarmStateAnnotation = Annotation.Root({
  research_data: Annotation<Record<string, unknown>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  twin_profile: Annotation<DigitalTwin | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  strategy: Annotation<Record<string, unknown>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  email_draft: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  confidence_score: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0,
  }),

  active_agent: Annotation<AgentName | null>({
    reducer: (x, y) => y,
    default: () => null,
  }),

  campaign_id: Annotation<string>({
    reducer: (x, y) => y,
    default: () => "",
  }),

  prospect_name: Annotation<string>({
    reducer: (x, y) => y,
    default: () => "",
  }),

  prospect_url: Annotation<string>({
    reducer: (x, y) => y,
    default: () => "",
  }),

  brand_context: Annotation<Record<string, unknown>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  skip_to_copywriter: Annotation<boolean>({
    reducer: (x, y) => y,
    default: () => false,
  }),

  swarm_mode: Annotation<"fast" | "deep">({
    reducer: (x, y) => y,
    default: () => "deep",
  }),

  trace_log: Annotation<Record<string, unknown>[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),

  /** Whether the approval gate was passed (set by approvalGate node) */
  approval_passed: Annotation<boolean>({
    reducer: (x, y) => y,
    default: () => false,
  }),

  /** Structured approval result (set by approvalGate node) */
  approval_result: Annotation<ApprovalResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
});

export type SwarmState = typeof SwarmStateAnnotation.State;

// ── Sandbox Node ──

async function sandboxNode(state: SwarmState) {
  const { email_draft, twin_profile, campaign_id } = state;

  if (!email_draft || !twin_profile) return { active_agent: null };

  await broadcastAgentUpdate(campaign_id, {
    agent: "consensus",
    status: "working",
    message: "Simulez reacția prospectului în Sandbox...",
    confidence_delta: 5,
    timestamp: Date.now(),
  });

  const reaction_map = await simulateReaction(
    email_draft,
    twin_profile,
    state.brand_context,
  );

  await broadcastAgentUpdate(campaign_id, {
    agent: "consensus",
    status: "done",
    message: "Simulare finalizată. Digital Twin validat.",
    confidence_delta: 5,
    timestamp: Date.now(),
  });

  return {
    twin_profile: { ...twin_profile, reaction_map },
    active_agent: null,
    trace_log: [
      {
        agent: "sandbox",
        status: "done",
        message: `Reacție simulată — curiosity: ${reaction_map.curiosity}, trust: ${reaction_map.trust}`,
        reaction_map,
        timestamp: Date.now(),
      },
    ],
  };
}

// ── Build the Graph ──

const workflow = new StateGraph(SwarmStateAnnotation)
  .addNode("researcher", researcherAgent)
  .addNode("psychologist", psychologistAgent)
  .addNode("strategist", strategistAgent)
  .addNode("consensus", consensusAgent)
  .addNode("approval_gate", approvalGate)
  .addNode("copywriter", copywriterAgent)
  .addNode("sandbox", sandboxNode);

// START → researcher [+ psychologist + strategist in deep mode]
workflow.addConditionalEdges(START, (state: SwarmState) => {
  // Resume path: jump directly to copywriter
  if (state.skip_to_copywriter) return "copywriter";

  // Fast mode: only researcher
  if (state.swarm_mode === "fast") return "researcher";

  // Deep mode: all three in parallel
  return ["researcher", "psychologist", "strategist"];
});

// All research agents converge to consensus
workflow.addEdge("researcher", "consensus");
workflow.addEdge("psychologist", "consensus");
workflow.addEdge("strategist", "consensus");

// Consensus → Approval Gate
workflow.addEdge("consensus", "approval_gate");

// Approval Gate → Copywriter, END, or Consensus (retry)
workflow.addConditionalEdges("approval_gate", (state: SwarmState) => {
  // Fast mode: skip approval, go straight to copywriter
  if (state.swarm_mode === "fast") return "copywriter";

  // Resume path: skip approval check
  if (state.skip_to_copywriter) return "copywriter";

  // Check the approval result
  if (state.approval_passed) return "copywriter";

  // Approval failed — stop the swarm (user must review and resume)
  return END;
});

// Copywriter → Sandbox (deep) or END (fast)
workflow.addConditionalEdges("copywriter", (state: SwarmState) => {
  if (state.swarm_mode === "fast") return END;

  // Only run sandbox if we have a draft
  if (state.email_draft) return "sandbox";
  return END;
});

// Sandbox → END
workflow.addEdge("sandbox", END);

export const swarmGraph = workflow.compile();
