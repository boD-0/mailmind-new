import { getAgentModel } from "./swarm/agents/llm";
import { safeJsonParse } from "./utils";

/**
 * Verifică dacă emailul generat are riscuri de spam sau conținut agresiv.
 */
export async function checkSpamRisk(email: string): Promise<{ score: number; flags: string[] }> {
  const fallback = { score: 0, flags: [] };
  try {
    const model = getAgentModel();

    const spamPrompt = `
      Ești un expert în livrabilitate email (Spam Guard).
      Analizează următorul draft de email și identifică riscurile de a fi marcat ca SPAM sau de a fi perceput negativ.
      
      Email:
      ${email}
      
      Returnează un scor de risc (0-100, unde 0 e perfect sigur) și o listă de "flags" (motive).
      Răspunde EXCLUSIV în format JSON cu cheile: score (number), flags (array of strings).
    `;

    const response = await model.invoke(spamPrompt);
    const content = response.content as string;
    
    return safeJsonParse(content, fallback);
  } catch (error) {
    console.error("Spam Guard Error:", error);
    return fallback;
  }
}
