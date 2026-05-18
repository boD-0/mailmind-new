import { SwarmState } from "./graph";
import { createClient } from "@/lib/supabase/server";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";

export async function approvalGate(state: SwarmState) {
const { campaign_id, research_data, strategy, twin_profile } = state;
  const supabase = await createClient();

  // 1. Salvează starea în DB cu status 'awaiting_approval'
  const { error } = await supabase.from('campaigns').update({
    status: 'awaiting_approval',
    research_data,
    strategy,
    twin_profile,
  }).eq('id', campaign_id);

  if (error) {
    console.error("Error updating campaign status in Approval Gate:", error);
  }

  // 2. Broadcast pe Realtime
  const update = {
    agent: 'consensus' as const, // Reutilizăm consensus pentru mesajul de gate
    status: 'idle' as const,
    message: 'Research complet. Aștept aprobarea ta pentru a porni Copywriter-ul.',
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  // 3. Returnăm starea marcată ca fiind în așteptare. 
  // Graful se va opri aici dacă nu există o muchie care să continue automat sau dacă folosim un mecanism de întrerupere.
  return {
    active_agent: null,
    trace_log: [update]
  };
}
