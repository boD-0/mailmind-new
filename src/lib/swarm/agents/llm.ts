import { ChatOpenAI } from "@langchain/openai";
import { db } from "@/db/drizzle";
import { apiUsage } from "@/db/schema";

// ── Provider detection ──

function getProviderConfig() {
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
    };
  }
  if (process.env.TOGETHER_AI_API_KEY) {
    return {
      apiKey: process.env.TOGETHER_AI_API_KEY,
      baseURL: "https://api.together.xyz/v1",
    };
  }
  throw new Error("Missing AI provider API key. Set OPENAI_API_KEY or TOGETHER_AI_API_KEY.");
}

// ── Model routing: mini (cheap) vs full (powerful) ──

const MINI_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  together: "meta-llama/Llama-3-8b-chat-hf",
};

const FULL_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  together: "meta-llama/Llama-3-70b-chat-hf",
};

function getProvider(): "openai" | "together" {
  if (process.env.OPENAI_API_KEY) return "openai";
  return "together";
}

/**
 * Mini model — cheaper, faster.
 * Used by: Researcher, Psychologist (high-volume, low-complexity tasks).
 */
export function getMiniModel(temperature = 0.7): ChatOpenAI {
  const config = getProviderConfig();
  const provider = getProvider();
  return new ChatOpenAI({
    apiKey: config.apiKey,
    configuration: { baseURL: config.baseURL },
    modelName: MINI_MODELS[provider],
    temperature,
  });
}

/**
 * Full model — more capable, more expensive.
 * Used by: Strategist, Copywriter (high-quality output required).
 */
export function getFullModel(temperature = 0.7): ChatOpenAI {
  const config = getProviderConfig();
  const provider = getProvider();
  return new ChatOpenAI({
    apiKey: config.apiKey,
    configuration: { baseURL: config.baseURL },
    modelName: FULL_MODELS[provider],
    temperature,
  });
}

/**
 * Legacy alias — returns the full model for backward compatibility.
 * @deprecated Use getMiniModel() or getFullModel() explicitly.
 */
export function getAgentModel(): ChatOpenAI {
  return getFullModel();
}

// ── Cost logging ──

/**
 * Logs an API usage record for cost tracking and analytics.
 * Fire-and-forget — errors are logged but don't throw.
 */
export async function logApiUsage(params: {
  userId: string;
  endpoint: string;
  tokensUsed: number;
  modelUsed: string;
  statusCode?: number;
  durationMs?: number;
}): Promise<void> {
  try {
    await db.insert(apiUsage).values({
      userId: params.userId,
      endpoint: params.endpoint,
      method: "POST",
      tokensUsed: params.tokensUsed,
      requestCount: 1,
      statusCode: params.statusCode ?? 200,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[logApiUsage] Failed to log usage:", error);
  }
}

/**
 * Estimate token count from a string (rough heuristic: ~4 chars per token).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
