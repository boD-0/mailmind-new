import { SwarmState } from "../graph";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";
import { getAgentModel } from "./llm";
import { checkSpamRisk } from "@/lib/spam-guard";

export async function copywriterAgent(state: SwarmState) {
const { strategy, twin_profile, campaign_id, prospect_name, brand_context } = state;

  const update = {
    agent: 'copywriter' as const,
    status: 'working' as const,
    message: 'Generez draftul de email folosind strategia și profilul psihologic...',
    confidence_delta: 15,
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  try {
    const model = getAgentModel();

    const copywriterPrompt = `
      Ești un Copywriter de elită, expert în email-uri de outreach personalizate.
      Scrie un email pentru ${prospect_name} folosind strategia de mai jos și adaptat profilului lor OCEAN.
      
      Strategie:
      ${JSON.stringify(strategy)}
      
      Digital Twin Profile:
      ${JSON.stringify(twin_profile)}

      Brand Context (Cine suntem noi):
      ${JSON.stringify(brand_context)}

      Instrucțiuni:
      1. Folosește hook-ul propus.
      2. Adaptează tonul conform tone_advice și scorului de Openness/Agreeableness din profilul OCEAN.
      3. Emailul trebuie să fie scurt, de impact și să invite la o conversație.
      4. Nu folosi clișee de marketing.

      Răspunde DOAR cu textul emailului (Subiect + Corp).
    `;

    const response = await model.invoke(copywriterPrompt);
    const email_draft = response.content as string;

    // 5. Integrare SpamGuard (Sprint 6)
    const spamResult = await checkSpamRisk(email_draft);
    
    const doneUpdate = {
      agent: 'copywriter' as const,
      status: 'done' as const,
      message: spamResult.score > 30 
        ? `Draft finalizat, dar cu riscuri detectate (${spamResult.score}/100).` 
        : 'Draft email finalizat și verificat anti-spam.',
      confidence_delta: spamResult.score > 30 ? 5 : 15,
      timestamp: Date.now()
    };

    await broadcastAgentUpdate(campaign_id, doneUpdate);

    return {
      email_draft,
      confidence_score: spamResult.score > 50 ? 60 : 95,
      trace_log: [update, doneUpdate]
    };
  } catch (error) {
    console.error("Copywriter Agent Error:", error);
    const errorUpdate = {
      agent: 'copywriter' as const,
      status: 'conflict' as const,
      message: `Eroare la scrierea emailului: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_delta: 0,
      timestamp: Date.now()
    };
    await broadcastAgentUpdate(campaign_id, errorUpdate);
    return {
      active_agent: 'copywriter' as const,
      trace_log: [update, errorUpdate]
    };
  }
}
