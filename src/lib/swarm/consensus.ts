import { SwarmState } from "./graph";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";

export async function consensusAgent(state: SwarmState) {
const { campaign_id, confidence_score, twin_profile, email_draft } = state;

  // Calculăm scorul de consens bazat pe prezența datelor critice
  let calculated_score = 0;
  if (state.research_data) calculated_score += 20;
  if (twin_profile) calculated_score += 30;
  if (state.strategy) calculated_score += 20;
  if (email_draft) calculated_score += 30;

  const update = {
    agent: 'consensus' as const,
    status: 'done' as const,
    message: `Consens atins. Scorul de încredere agregat: ${calculated_score}%`,
    confidence_delta: calculated_score - confidence_score,
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  return {
    active_agent: 'approval_gate' as const,
    confidence_score: calculated_score,
    trace_log: [update]
  };
}
