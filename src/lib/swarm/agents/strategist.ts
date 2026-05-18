import { SwarmState } from "../graph";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";
import { getAgentModel } from "./llm";
import { safeJsonParse } from "@/lib/utils";

export async function strategistAgent(state: SwarmState) {
const { research_data, twin_profile, campaign_id, brand_context } = state;

  const update = {
    agent: 'strategist' as const,
    status: 'working' as const,
    message: 'Construiesc strategia de abordare personalizată...',
    confidence_delta: 10,
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  const fallbackStrategy = {
    hook: "Inquiry about your recent work",
    angle: "General value proposition",
    sequence: ["Intro", "Value", "CTA"],
    tone_advice: "Professional and respectful"
  };

  try {
    const model = getAgentModel();

    const strategistPrompt = `
      Ești un Strategist de Growth Marketing.
      Pe baza datelor de research și a profilului psihologic al prospectului, creează o strategie de outreach.
      
      Research Data:
      ${JSON.stringify(research_data)}
      
      Digital Twin Profile:
      ${JSON.stringify(twin_profile)}

      Brand Context (Cine suntem noi):
      ${JSON.stringify(brand_context)}

      Răspunde în JSON cu cheile:
      - hook: cel mai bun unghi de deschidere (string)
      - angle: propunerea de valoare principală (string)
      - sequence: pașii recomandați (array de string-uri)
      - tone_advice: cum ar trebui să sune emailul (string)
    `;

    const response = await model.invoke(strategistPrompt);
    const content = response.content as string;

    const strategy = safeJsonParse(content, fallbackStrategy);

    const doneUpdate = {
      agent: 'strategist' as const,
      status: 'done' as const,
      message: `Strategie finalizată. Unghi: ${strategy.angle}`,
      confidence_delta: 15,
      timestamp: Date.now()
    };

    await broadcastAgentUpdate(campaign_id, doneUpdate);

    return {
      strategy,
      trace_log: [update, doneUpdate]
    };
  } catch (error) {
    console.error("Strategist Agent Error:", error);
    const errorUpdate = {
      agent: 'strategist' as const,
      status: 'conflict' as const,
      message: `Eroare la crearea strategiei: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_delta: 0,
      timestamp: Date.now()
    };
    await broadcastAgentUpdate(campaign_id, errorUpdate);
    return {
      trace_log: [update, errorUpdate]
    };
  }
}
