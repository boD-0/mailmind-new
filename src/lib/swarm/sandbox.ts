import { DigitalTwin } from "@/types/twin";
import { getFullModel } from "./agents/llm";
import { safeJsonParse } from "@/lib/utils";

/**
 * Simulează reacția unui prospect (Digital Twin) la un draft de email.
 * Folosește modelul complet (GPT-4o / Llama-3-70b) pentru simualre de înaltă calitate.
 */
export async function simulateReaction(
  email: string,
  profile: DigitalTwin,
  brandContext?: Record<string, unknown>,
): Promise<DigitalTwin["reaction_map"]> {
  const fallbackReaction = {
    curiosity: 50,
    interest: 50,
    irritability: 20,
    trust: 50,
    urgency_felt: 30,
  };

  try {
    const model = getFullModel(0.5);

    const simulationPrompt = `Ești un expert în simularea comportamentului uman (Digital Twin).
Trebuie să simulezi reacția unui prospect la un email de outreach, bazându-te pe profilul lor psihologic OCEAN.

Email Draft:
${email}

Digital Twin Profile (OCEAN + custom signals):
${JSON.stringify(profile, null, 2)}

${
  brandContext && Object.keys(brandContext).length > 0
    ? `Brand Context (cine trimite emailul):
${JSON.stringify(brandContext, null, 2)}

Ține cont de:
- Industria brandului influențează relevanța (interest, trust)
- Tonul vocii influențează irritability (mismatch cu preferințele prospectului)
- Valorile brandului pot crește trust dacă se aliniază cu prospectul
- Pain points comune cresc urgency_felt`
    : ""
}

Evaluează emailul și returnează scoruri de reacție (0-100) pentru:
- curiosity: cât de mult îl va face să vrea să afle mai multe
- interest: cât de relevant este subiectul pentru nevoile lui
- irritability: cât de mult îl va deranja (prea lung, prea agresiv, etc.)
- trust: câtă încredere inspiră expeditorul
- urgency_felt: cât de mare este dorința de a răspunde rapid

Răspunde EXCLUSIV în JSON cu cheile corespunzătoare.`;

    const response = await model.invoke(simulationPrompt);
    const content = response.content as string;
    return safeJsonParse(content, fallbackReaction);
  } catch (error) {
    console.error("Sandbox Simulation Error:", error);
    return fallbackReaction;
  }
}
