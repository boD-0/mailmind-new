import { SwarmState } from "../graph";
import { DigitalTwin } from "@/types/twin";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";
import { getMiniModel } from "./llm";
import { safeJsonParse } from "@/lib/utils";

export async function psychologistAgent(state: SwarmState) {
const { research_data, campaign_id, prospect_url, brand_context } = state;

  const update = {
    agent: 'psychologist' as const,
    status: 'working' as const,
    message: 'Analizez trăsăturile psihologice (OCEAN) bazat pe research...',
    confidence_delta: 10,
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  const fallbackProfile = {
    ocean: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 30 },
    custom_signals: {
      communication_tone: "formal",
      decision_speed: "deliberate",
      pain_point_category: "efficiency",
      linkedin_activity: "medium",
      industry_maturity: "scaleup",
      role_tenure_months: 12
    }
  };

  try {
    const model = getMiniModel();

    const psychologistPrompt = `
      Ești un expert în psihologie comportamentală B2B.
      Pe baza datelor de research de mai jos, construiește un profil OCEAN complet.
      Folosește și semnalele implicite: tonul textelor publice, frecvența postărilor,
      tipul de conținut distribuit, rolul în organizație, vechimea în industrie.

      Research Data:
      ${JSON.stringify(research_data)}

      Brand Context (compania care contactează prospectul):
      ${JSON.stringify(brand_context)}

      Folosește Brand Context-ul mai sus pentru a înțelege CINE contactează prospectul:
      - Industria brandului influențează tipul de prospect care ar răspunde bine
      - Tonul vocii determină ce stil de comunicare ar atrage prospectul
      - Valorile brandului ajută la calibrarea scorurilor de agreeableness și trust
      - Pain points-urile brandului se aliniază cu pain_point_category din custom_signals

      Răspunde EXCLUSIV în JSON. Schema:
      {
        "ocean": {
          "openness": number (0-100),
          "conscientiousness": number (0-100),
          "extraversion": number (0-100),
          "agreeableness": number (0-100),
          "neuroticism": number (0-100)
        },
        "custom_signals": {
          "communication_tone": "formal" | "casual" | "technical" | "visionary",
          "decision_speed": "fast" | "deliberate" | "committee-based",
          "pain_point_category": "growth" | "efficiency" | "risk" | "prestige",
          "linkedin_activity": "high" | "medium" | "low" | "absent",
          "industry_maturity": "startup" | "scaleup" | "enterprise",
          "role_tenure_months": number
        }
      }
    `;

    const response = await model.invoke(psychologistPrompt);
    const profileData = safeJsonParse(response.content as string, fallbackProfile) as Pick<DigitalTwin, 'ocean' | 'custom_signals'>;

    const twin_profile: DigitalTwin = {
      ...profileData,
      reaction_map: {
        curiosity: 0,
        interest: 0,
        irritability: 0,
        trust: 0,
        urgency_felt: 0
      },
      generated_at: new Date().toISOString(),
      confidence: 85,
      sources_used: [prospect_url]
    };

    const doneUpdate = {
      agent: 'psychologist' as const,
      status: 'done' as const,
      message: `Profil Digital Twin generat. Openness: ${twin_profile.ocean.openness}/100.`,
      confidence_delta: 15,
      timestamp: Date.now()
    };

    await broadcastAgentUpdate(campaign_id, doneUpdate);

    return {
      twin_profile,
      trace_log: [update, doneUpdate]
    };
  } catch (error) {
    console.error("Psychologist Agent Error:", error);
    const errorUpdate = {
      agent: 'psychologist' as const,
      status: 'conflict' as const,
      message: `Eroare la generarea profilului: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_delta: 0,
      timestamp: Date.now()
    };
    await broadcastAgentUpdate(campaign_id, errorUpdate);
    return {
      trace_log: [update, errorUpdate]
    };
  }
}
