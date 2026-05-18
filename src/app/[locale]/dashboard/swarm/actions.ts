"use server";

import { requireOnboarding, getPlanLimits } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { swarmExecutions } from "@/db/schema";
import { AGENTS } from "@/lib/agents/definitions";
import { runAgentsInParallel } from "@/lib/agents/swarm";

export async function runSwarmAction(
  request: Request,
  selectedAgentIds: ("COPYWRITER" | "RESEARCHER" | "STRATEGIST" | "ANALYST")[],
  prompt: string
) {
  const user = await requireOnboarding(request);
  const limits = getPlanLimits(user.plan);

  if (selectedAgentIds.length > limits.maxAgents) {
    return {
      error: `Upgrade Required — planul tău (${user.plan}) permite maxim ${limits.maxAgents} agent(i).`,
    };
  }

  const selectedAgents = AGENTS.filter((a) => selectedAgentIds.includes(a.id));

  // Verifică dacă userul are acces la agenții selectați conform planului lor (opțional, dar bun pentru securitate)
  // Deși limits.maxAgents e verificat, putem verifica și individual dacă dorim strict feature gating pe agent type.

  const startTime = Date.now();

  try {
    const results = await runAgentsInParallel(
      selectedAgents,
      prompt,
      limits.aiModel
    );

    const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);
    const combinedResult = results
      .map((r) => `### ${r.agentName}\n${r.output}`)
      .join("\n\n");

    await db.insert(swarmExecutions).values({
      userId: user.id,
      agentsUsed: selectedAgentIds,
      inputPrompt: prompt,
      outputResult: combinedResult,
      modelUsed: limits.aiModel,
      tokensUsed: totalTokens,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    return { success: true, results };
  } catch (error) {
    console.error("Swarm AI Error:", error);
    await db.insert(swarmExecutions).values({
      userId: user.id,
      agentsUsed: selectedAgentIds,
      inputPrompt: prompt,
      modelUsed: limits.aiModel,
      status: "error",
      durationMs: Date.now() - startTime,
    });
    return { error: "A apărut o eroare la execuția agenților AI." };
  }
}
