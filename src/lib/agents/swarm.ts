import OpenAI from "openai";
import { AgentDefinition } from "./definitions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SwarmResult {
  agentId: string;
  agentName: string;
  output: string;
  tokensUsed: number;
}

export async function runAgentsInParallel(
  agents: AgentDefinition[],
  userPrompt: string,
  model: "gpt-4o" | "gpt-4o-mini"
): Promise<SwarmResult[]> {
  const promises = agents.map(async (agent): Promise<SwarmResult> => {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
    });

    return {
      agentId: agent.id,
      agentName: agent.name,
      output: response.choices[0]?.message?.content ?? "",
      tokensUsed: response.usage?.total_tokens ?? 0,
    };
  });

  return Promise.all(promises);
}
