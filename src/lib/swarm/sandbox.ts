import { DigitalTwin } from "@/types/twin";
import { getAgentModel } from "./agents/llm";
import { safeJsonParse } from "@/lib/utils";

/**
 * Simulează reacția unui prospect (Digital Twin) la un draft de email.
 */
export async function simulateReaction(email: string, profile: DigitalTwin, brandContext?: Record<string, unknown>): Promise<DigitalTwin['reaction_map']> {
const fallbackReaction = {
    curiosity: 50,
    interest: 50,
    irritability: 20,
    trust: 50,
    urgency_felt: 30
  };

  try {
    const model = getAgentModel();

    const simulationPrompt = `
      Ești un expert în simularea comportamentului uman (Digital Twin).
      Trebuie să simulezi reacția unui prospect la un email de outreach, bazându-te pe profilul lor psihologic OCEAN.

      Email Draft:
      ${email}

      Digital Twin Profile:
      ${JSON.stringify(profile)}

      ${brandContext && Object.keys(brandContext).length > 0 ? `Brand Context (cine trimite emailul):
      ${JSON.stringify(brandContext)}

      Ține cont de brandul care trimite emailul când evaluezi reacțiile:
      - Industria brandului influențează relevanța (interest, trust)
      - Tonul vocii influențează irritability (dacă e mismatch cu preferințele prospectului)
      - Valorile brandului pot crește trust dacă se aliniază cu valorile prospectului
      - Pain points comune cresc urgency_felt
      ` : ''}
      Evaluează emailul și returnează scoruri de reacție (0-100) pentru următoarele metrici:
      - curiosity: cât de mult îl va face să vrea să afle mai multe.
      - interest: cât de relevant este subiectul pentru nevoile lui.
      - irritability: cât de mult îl va deranja acest email (prea lung, prea agresiv, etc).
      - trust: câtă încredere inspiră expeditorul.
      - urgency_felt: cât de mare este dorința de a răspunde rapid.

      Răspunde EXCLUSIV în JSON cu cheile corespunzătoare.
    `;

    const response = await model.invoke(simulationPrompt);
    const content = response.content as string;

    return safeJsonParse(content, fallbackReaction);
  } catch (error) {
    console.error("Sandbox Simulation Error:", error);
    return fallbackReaction;
  }
}
