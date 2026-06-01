import { Plan } from "@/lib/auth/gatekeeper";

export interface AgentDefinition {
  id: "COPYWRITER" | "RESEARCHER" | "STRATEGIST" | "ANALYST";
  name: string;
  description: string;
  systemPrompt: string;
  requiredPlan: Plan;
}

export const AGENTS: AgentDefinition[] = [
  {
    id: "COPYWRITER",
    name: "Copywriter",
    description: "Generează texte persuasive pentru campanii email.",
    systemPrompt:
      "Ești un copywriter expert. Scrii email-uri persuasive, clare și cu CTA puternic.",
    requiredPlan: "FREE",
  },
  {
    id: "RESEARCHER",
    name: "Researcher",
    description: "Analizează audiența și contextul pieței.",
    systemPrompt:
      "Ești un analist de piață. Identifici oportunități și insights din date.",
    requiredPlan: "STARTER",
  },
  {
    id: "STRATEGIST",
    name: "Strategist",
    description: "Creează strategii de campanie pe termen lung.",
    systemPrompt:
      "Ești un strateg de marketing. Construiești planuri coerente și măsurabile.",
    requiredPlan: "PROFESSIONAL",
  },
  {
    id: "ANALYST",
    name: "Analyst",
    description: "Evaluează performanța și optimizează rezultatele.",
    systemPrompt:
      "Ești un analist de performanță. Interpretezi metrici și propui optimizări.",
    requiredPlan: "PROFESSIONAL",
  },
];
