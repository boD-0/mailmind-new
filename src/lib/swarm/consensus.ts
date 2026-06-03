import { SwarmState } from "./graph";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";
import { DigitalTwin } from "@/types/twin";

// ── Scoring weights (must sum to 100) ──

const WEIGHTS = {
  /** Research data quality — facts, tone, news completeness */
  RESEARCH: 25,
  /** OCEAN profile existence + alignment with brand context */
  TWIN_MATCH: 25,
  /** Strategy quality — hook specificity, angle relevance */
  STRATEGY: 20,
  /** Agent completion — all agents ran without errors */
  AGENT_HEALTH: 15,
  /** Content readiness — email draft present and actionable */
  CONTENT: 15,
} as const;

// ── Scoring helpers ──

function scoreResearch(data: Record<string, unknown>): number {
  if (!data || Object.keys(data).length === 0) return 0;
  let score = 0;
  const facts = Array.isArray(data.facts) ? data.facts.length : 0;
  if (facts >= 3) score += 12;
  else if (facts > 0) score += 6;
  if (data.tone && typeof data.tone === "string" && data.tone.length > 0) score += 7;
  if (data.news && typeof data.news === "string" && data.news.length > 20) score += 6;
  return Math.min(score, WEIGHTS.RESEARCH);
}

function scoreTwinMatch(twin: DigitalTwin | null, brandContext: Record<string, unknown>): number {
  if (!twin || !twin.ocean) return 0;
  let score = 0;

  // OCEAN profile exists with non-zero values
  const oceanKeys = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  const validDimensions = oceanKeys.filter(
    (k) => typeof twin.ocean[k] === "number" && twin.ocean[k] > 0,
  ).length;
  score += Math.round((validDimensions / 5) * 12);

  // Custom signals present
  if (twin.custom_signals) {
    const signals = twin.custom_signals;
    if (signals.communication_tone && signals.communication_tone !== "formal") score += 4;
    if (signals.decision_speed && signals.decision_speed !== "deliberate") score += 3;
    if (signals.pain_point_category) score += 3;
    if (signals.industry_maturity) score += 3;
  }

  return Math.min(score, WEIGHTS.TWIN_MATCH);
}

function scoreStrategy(strategy: Record<string, unknown>): number {
  if (!strategy || Object.keys(strategy).length === 0) return 0;
  let score = 0;
  if (strategy.hook && typeof strategy.hook === "string" && strategy.hook.length > 10) score += 8;
  if (strategy.angle && typeof strategy.angle === "string" && strategy.angle.length > 10) score += 6;
  if (Array.isArray(strategy.sequence) && strategy.sequence.length >= 2) score += 3;
  if (strategy.tone_advice && typeof strategy.tone_advice === "string") score += 3;
  return Math.min(score, WEIGHTS.STRATEGY);
}

function scoreAgentHealth(traceLog: Record<string, unknown>[]): number {
  if (!traceLog || traceLog.length === 0) return 0;

  // Count agents that completed successfully (status "done")
  const completedCount = traceLog.filter((log) => log.status === "done").length;
  const errorCount = traceLog.filter((log) => log.status === "conflict").length;

  if (errorCount > 0) return 5; // Penalized for errors
  if (completedCount >= 4) return WEIGHTS.AGENT_HEALTH;
  if (completedCount >= 2) return 10;
  return 5;
}

function scoreContent(emailDraft: string | null): number {
  if (!emailDraft || emailDraft.length === 0) return 0;
  let score = 0;
  if (emailDraft.length > 100) score += 5;
  if (emailDraft.includes("Subject:") || emailDraft.includes("Subiect:")) score += 5;
  if (emailDraft.length > 300) score += 5;
  return Math.min(score, WEIGHTS.CONTENT);
}

// ── Main consensus agent ──

export async function consensusAgent(state: SwarmState) {
  const {
    campaign_id,
    confidence_score: previousScore,
    research_data,
    twin_profile,
    strategy,
    email_draft,
    trace_log,
  } = state;
  const brand_context = state.brand_context;
  void brand_context;

  await broadcastAgentUpdate(campaign_id, {
    agent: "consensus",
    status: "working",
    message: "Calculez scorul de consens ponderat...",
    timestamp: Date.now(),
  });

  // Calculate individual component scores
  const researchScore = scoreResearch(research_data);
  const twinScore = scoreTwinMatch(twin_profile, brand_context);
  const strategyScore = scoreStrategy(strategy);
  const healthScore = scoreAgentHealth(trace_log);
  const contentScore = scoreContent(email_draft);

  const totalScore = researchScore + twinScore + strategyScore + healthScore + contentScore;

  // Build detailed breakdown for debugging
  const breakdown = {
    total: totalScore,
    components: {
      research: researchScore,
      twin_match: twinScore,
      strategy: strategyScore,
      agent_health: healthScore,
      content: contentScore,
    },
    max_possible: Object.values(WEIGHTS).reduce((a, b) => a + b, 0),
    previous_score: previousScore,
  };

  const delta = totalScore - previousScore;

  const message =
    totalScore >= 80
      ? `Consens robust — scor ${totalScore}%. Toți agenții sunt aliniați.`
      : totalScore >= 60
        ? `Consens moderat — scor ${totalScore}%. Câțiva parametri suboptimali.`
        : `Consens slab — scor ${totalScore}%. Review necesar înainte de a continua.`;

  await broadcastAgentUpdate(campaign_id, {
    agent: "consensus",
    status: "done",
    message,
    confidence_delta: delta,
    timestamp: Date.now(),
  });

  return {
    active_agent: "approval_gate" as const,
    confidence_score: totalScore,
    trace_log: [
      ...trace_log,
      {
        agent: "consensus",
        status: "done",
        message,
        breakdown,
        timestamp: Date.now(),
      },
    ],
  };
}
