import { getMiniModel } from "./swarm/agents/llm";
import { safeJsonParse } from "./utils";

// ── Static rule-based checks ──

/** Words/phrases commonly flagged by spam filters. */
const SPAM_TRIGGER_WORDS = [
  "free", "act now", "limited time", "urgent", "buy now", "click here",
  "exclusive deal", "100% free", "money back", "guaranteed", "no obligation",
  "order now", "special promotion", "call now", "subscribe now",
  "this won't last", "once in a lifetime", "while supplies last",
  "gratuit", "acum", "ofertă limitată", "urgent", "cumpără acum",
  "click aici", "ofertă exclusivă", "100% gratuit", "garanție",
  "comandă acum", "promoție specială", "sună acum",
];

/** Maximum recommended subject line length in characters. */
const MAX_SUBJECT_LENGTH = 60;

/** Target text-to-link ratio (text chars per link). */
const MIN_TEXT_PER_LINK = 300;

function extractSubject(email: string): string {
  const match = email.match(/^(?:Subject|Subiect):\s*(.+)$/im);
  return match?.[1]?.trim() ?? "";
}

function extractBody(email: string): string {
  // Remove subject line
  const body = email.replace(/^(?:Subject|Subiect):\s*.+$/im, "").trim();
  return body;
}

function countLinks(text: string): number {
  const urlPattern = /https?:\/\/[^\s)]+/gi;
  const matches = text.match(urlPattern);
  return matches ? matches.length : 0;
}

interface RuleResult {
  score: number;
  flags: string[];
}

/**
 * Static rule-based spam analysis.
 * Returns a score 0-100 (0 = perfectly safe) and a list of flag descriptions.
 */
function runStaticRules(email: string): RuleResult {
  const flags: string[] = [];
  let score = 0;
  const lowerEmail = email.toLowerCase();

  // 1. Spam trigger words
  const foundTriggers = SPAM_TRIGGER_WORDS.filter((word) => lowerEmail.includes(word));
  if (foundTriggers.length >= 3) {
    score += 20;
    flags.push(`Spam trigger words detected: ${foundTriggers.join(", ")}`);
  } else if (foundTriggers.length > 0) {
    score += 8;
    flags.push(`Potential spam trigger: ${foundTriggers.join(", ")}`);
  }

  // 2. Subject line length
  const subject = extractSubject(email);
  if (subject.length > MAX_SUBJECT_LENGTH) {
    score += 12;
    flags.push(`Subject line too long (${subject.length} chars, max recommended ${MAX_SUBJECT_LENGTH})`);
  }
  if (subject.length === 0) {
    score += 10;
    flags.push("Missing subject line");
  }

  // 3. ALL CAPS ratio in subject
  const capsRatio = (subject.match(/[A-ZĂÂÎȘȚ]/g)?.length ?? 0) / Math.max(1, subject.length);
  if (capsRatio > 0.5) {
    score += 15;
    flags.push(`Subject line is >50% uppercase (${Math.round(capsRatio * 100)}%) — looks aggressive`);
  }

  // 4. Body length (too short = likely spam)
  const body = extractBody(email);
  if (body.length < 50) {
    score += 10;
    flags.push(`Email body too short (${body.length} chars) — lacks substance`);
  }

  // 5. Text-to-link ratio
  const linkCount = countLinks(body);
  if (linkCount > 0) {
    const textPerLink = body.length / linkCount;
    if (textPerLink < MIN_TEXT_PER_LINK) {
      score += 18;
      flags.push(
        `Low text-to-link ratio: ${Math.round(textPerLink)} chars per link (min recommended ${MIN_TEXT_PER_LINK}). ${linkCount} link(s) detected.`,
      );
    } else if (linkCount > 3) {
      score += 8;
      flags.push(`${linkCount} links detected — consider reducing to 1-2.`);
    }
  }

  // 6. Excessive punctuation (!!! or ???)
  const excessivePunctuation = (body.match(/!{2,}|\?{2,}/g) ?? []).length;
  if (excessivePunctuation > 2) {
    score += 8;
    flags.push("Excessive punctuation detected (!!! or ???)");
  }

  // 7. Email length too long
  if (body.length > 2000) {
    score += 5;
    flags.push(`Email body very long (${body.length} chars) — may get clipped or marked as promotional.`);
  }

  return { score: Math.min(score, 50), flags }; // Cap rule-based score at 50 (LLM contributes the rest)
}

// ── LLM-based spam analysis ──

async function runLlmCheck(email: string): Promise<RuleResult> {
  const fallback = { score: 0, flags: [] };
  try {
    const model = getMiniModel(0.3); // Lower temp for classification tasks

    const spamPrompt = `You are a spam detection engine. Analyze this email draft and rate its spam risk.

Email:
${email}

Return a JSON object with:
- "score": spam risk 0-100 (0 = perfectly safe, 100 = guaranteed spam)
- "flags": array of strings explaining specific issues found

Consider: clickbait language, urgency tactics, misleading claims, too-good-to-be-true offers, deceptive formatting, lack of personalization, generic greetings, suspicious links, request for personal info.

Respond EXCLUSIV with valid JSON.`;

    const response = await model.invoke(spamPrompt);
    const content = response.content as string;
    return safeJsonParse(content, fallback);
  } catch (error) {
    console.error("Spam Guard LLM Error:", error);
    return fallback;
  }
}

// ── Public API ──

export interface SpamResult {
  /** Overall spam risk score 0-100 (0 = perfectly safe, 100 = guaranteed spam) */
  score: number;
  /** Human-readable flags explaining detected issues */
  flags: string[];
  /** Breakdown: static rule-based score */
  ruleScore: number;
  /** Breakdown: LLM-based score */
  llmScore: number;
  /** Deliverability rating */
  deliverability: "excellent" | "good" | "risky" | "poor";
}

/**
 * Comprehensive spam risk analysis combining:
 * 1. Static rule-based checks (trigger words, subject length, text/link ratio, punctuation)
 * 2. LLM-based semantic analysis (tone, deception, clickbait)
 *
 * Returns a combined score and detailed flags.
 */
export async function checkSpamRisk(email: string): Promise<SpamResult> {
  // Run static rules and LLM check in parallel
  const [ruleResult, llmResult] = await Promise.all([
    Promise.resolve(runStaticRules(email)),
    runLlmCheck(email),
  ]);

  // Combined score: static rules (max 50) + LLM (max 50), capped at 100
  const combinedScore = Math.min(ruleResult.score + (llmResult.score / 2), 100);
  const allFlags = [...ruleResult.flags, ...llmResult.flags.map((f) => `[LLM] ${f}`)];

  let deliverability: SpamResult["deliverability"];
  if (combinedScore <= 15) deliverability = "excellent";
  else if (combinedScore <= 30) deliverability = "good";
  else if (combinedScore <= 50) deliverability = "risky";
  else deliverability = "poor";

  return {
    score: Math.round(combinedScore),
    flags: allFlags,
    ruleScore: ruleResult.score,
    llmScore: llmResult.score,
    deliverability,
  };
}
