import { swarmGraph } from "./graph";
import { createClient } from "@/lib/supabase/server";

export async function resumeSwarmFromCopywriter(campaignId: string) {
  const supabase = await createClient();

  // 1. Recuperăm datele campaniei
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  // 2. Pregătim starea inițială pentru reluare
  // Observație: În LangGraph, pentru a relua dintr-un punct anume fără checkpointer persistent pe server,
  // putem pur și simplu să re-invocăm graful cu starea acumulată până acum.
  // Totuși, pentru a evita re-rularea nodurilor de început, am putea restructura graful 
  // sau folosi un checkpointer. 
  
  // O metodă simplă este să folosim o versiune a grafului care începe de la Copywriter.
  // Dar pentru acest blueprint, vom simula reluarea prin apelarea invoke cu starea curentă.
  
  const initialState = {
    campaign_id: campaignId,
    research_data: campaign.research_data,
    strategy: campaign.strategy,
    twin_profile: campaign.twin_profile,
    brand_context: campaign.brand_context || {},
    prospect_name: campaign.prospect_name,
    prospect_url: campaign.prospect_url,
    confidence_score: campaign.confidence_score || 0,
    skip_to_copywriter: true,
    trace_log: []
  };

  // 3. Rulăm graful. 
  // Pentru a "sări" peste nodurile deja executate, am putea folosi `interrupt` sau logică condițională.
  // În acest context, cel mai simplu este să definim o funcție care rulează doar restul grafului.
  
  // Totuși, conform blueprint-ului "resumeSwarmFromCopywriter", vom invoca graful.
  // Pentru a ne asigura că nu re-execută totul, am putea adăuga un flag în state sau folosi noduri condiționate.
  
  // O altă abordare: creăm un sub-graf pentru partea de output.
  
  return await swarmGraph.invoke(initialState);
}
