import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { AgentName } from "@/types/swarm";
import { DigitalTwin } from "@/types/twin";
import { researcherAgent } from "./agents/researcher";
import { psychologistAgent } from "./agents/psychologist";
import { strategistAgent } from "./agents/strategist";
import { copywriterAgent } from "./agents/copywriter";
import { consensusAgent } from "./consensus";
import { approvalGate } from "./approval-gate";
import { simulateReaction } from "./sandbox";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";

export const SwarmStateAnnotation = Annotation.Root({
  // ... existing annotations ...
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

  swarm_mode: Annotation<'fast' | 'deep'>({
    reducer: (x, y) => y,
    default: () => 'deep',
  }),

  trace_log: Annotation<Record<string, unknown>[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),
});

export type SwarmState = typeof SwarmStateAnnotation.State;

// Sandbox Node implementation
async function sandboxNode(state: SwarmState) {
const { email_draft, twin_profile, campaign_id } = state;
  
  if (!email_draft || !twin_profile) return { active_agent: null };

  const update = {
    agent: 'consensus' as const, // We reuse consensus for final simulation update
    status: 'working' as const,
    message: 'Simulez reacția prospectului în Sandbox...',
    confidence_delta: 5,
    timestamp: Date.now()
  };
  await broadcastAgentUpdate(campaign_id, update);

  const reaction_map = await simulateReaction(email_draft, twin_profile);
  
  const doneUpdate = {
    agent: 'consensus' as const,
    status: 'done' as const,
    message: 'Simulare finalizată. Digital Twin validat.',
    confidence_delta: 5,
    timestamp: Date.now()
  };
  await broadcastAgentUpdate(campaign_id, doneUpdate);

  return {
    twin_profile: { ...twin_profile, reaction_map },
    active_agent: null,
    trace_log: [update, doneUpdate]
  };
}

// Construim Graful
const workflow = new StateGraph(SwarmStateAnnotation)
  .addNode("researcher", researcherAgent)
  .addNode("psychologist", psychologistAgent)
  .addNode("strategist", strategistAgent)
  .addNode("consensus", consensusAgent)
  .addNode("approval_gate", approvalGate)
  .addNode("copywriter", copywriterAgent)
  .addNode("sandbox", sandboxNode);

// Definim fluxul conform blueprint-ului:
// Research + Psychologist + Strategist (paralel) -> CONSENSUS -> APPROVAL GATE
workflow.addConditionalEdges(START, (state) => {
  if (state.skip_to_copywriter) return "copywriter";
  
  if (state.swarm_mode === 'fast') {
    return ["researcher"]; // În modul fast, sărim peste psiholog și strateg inițial
  }
  
  return ["researcher", "psychologist", "strategist"];
});

workflow
  .addEdge("researcher", "consensus")
  .addEdge("psychologist", "consensus")
  .addEdge("strategist", "consensus")
  
  .addEdge("consensus", "approval_gate")
  
  // Decidem dacă mergem mai departe sau ne oprim pentru aprobare
  workflow.addConditionalEdges("approval_gate", (state) => {
    // În modul fast, sărim peste aprobare
    if (state.swarm_mode === 'fast') return "copywriter";

    // Dacă am venit prin resume (skip_to_copywriter este true), continuăm spre copywriter.
    if (state.skip_to_copywriter) return "copywriter";

    // Altfel, ne oprim (returnăm END).
    return END;
  });

  workflow.addConditionalEdges("copywriter", (state) => {
    if (state.swarm_mode === 'fast') return END;
    return "sandbox";
  });

  workflow.addEdge("sandbox", END);

export const swarmGraph = workflow.compile();
