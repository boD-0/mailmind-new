"use server";

import { db } from "@/db/drizzle";
import { emailEvents, swarmExecutions, prospects } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and, sql, count, desc } from "drizzle-orm";
import { headers } from "next/headers";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CoachingInsight {
  type: "subject_line" | "tone" | "agent" | "oceano" | "timing" | "general";
  title: string;
  description: string;
  confidence: number; // 0-100 how confident the insight is based on data
  evidence: string; // short evidence snippet
  actionable: boolean;
  cta?: string; // call to action text
}

export interface CoachingData {
  insights: CoachingInsight[];
  summary: {
    totalCampaigns: number;
    totalEmailsSent: number;
    avgOpenRate: number;
    avgReplyRate: number;
    topAgent: string | null;
    topAgentScore: number;
    bestTone: string | null;
    prospectsWithRepeat: number;
  };
}

// ─── Generate Coaching Insights ─────────────────────────────────────────────

export async function getCoachingInsights(): Promise<CoachingData | null> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: new Headers(head) } as any);
  if (!session) return null;

  const userId = session.user.id;

  // ── Aggregate email stats ──────────────────────────────────────────────
  const eventRows = await db
    .select({
      eventType: emailEvents.eventType,
      cnt: count(),
    })
    .from(emailEvents)
    .where(eq(emailEvents.userId, userId))
    .groupBy(emailEvents.eventType);

  const eventCounts: Record<string, number> = {};
  for (const r of eventRows) {
    if (r.eventType) eventCounts[r.eventType] = r.cnt;
  }

  const totalSent = Object.values(eventCounts).reduce((a, b) => a + b, 0) || 0;
  const opens = eventCounts["open"] || 0;
  const replies = eventCounts["reply"] || 0;
  const clicks = eventCounts["click"] || 0;
  const avgOpenRate = totalSent > 0 ? Math.round((opens / totalSent) * 100) : 0;
  const avgReplyRate = totalSent > 0 ? Math.round((replies / totalSent) * 100) : 0;

  // ── Agent performance from swarm executions ─────────────────────────────
  const swarmRows = await db
    .select({
      agentsUsed: swarmExecutions.agentsUsed,
      status: swarmExecutions.status,
      tokensUsed: swarmExecutions.tokensUsed,
    })
    .from(swarmExecutions)
    .where(eq(swarmExecutions.userId, userId))
    .orderBy(desc(swarmExecutions.createdAt))
    .limit(50);

  const totalCampaigns = swarmRows.length;
  const successfulSwarms = swarmRows.filter((r) => r.status === "success");

  // Count agent usage across successful swarms
  const agentScores: Record<string, { count: number; tokens: number }> = {};
  for (const s of successfulSwarms) {
    for (const agent of s.agentsUsed || []) {
      if (!agentScores[agent]) agentScores[agent] = { count: 0, tokens: 0 };
      agentScores[agent].count++;
      agentScores[agent].tokens += s.tokensUsed || 0;
    }
  }

  let topAgent: string | null = null;
  let topAgentScore = 0;
  for (const [agent, data] of Object.entries(agentScores)) {
    const score = data.count;
    if (score > topAgentScore) {
      topAgentScore = score;
      topAgent = agent;
    }
  }

  // ── Prospect repeat rate ───────────────────────────────────────────────
  const prospectRows = await db
    .select({ cnt: count() })
    .from(prospects)
    .where(
      and(
        eq(prospects.userId, userId),
        sql`${prospects.lastContactedAt} IS NOT NULL`,
      ),
    );
  const prospectsWithRepeat = prospectRows[0]?.cnt ?? 0;

  // ── Generate insights ──────────────────────────────────────────────────
  const insights: CoachingInsight[] = [];

  // 1. Open rate insight
  if (totalSent >= 3) {
    if (avgOpenRate >= 50) {
      insights.push({
        type: "general",
        title: "Your open rates are excellent",
        description: `Your average open rate is ${avgOpenRate}% — well above the industry average of 20-30%. Your subject lines are clearly resonating with prospects.`,
        confidence: Math.min(100, avgOpenRate),
        evidence: `Based on ${totalSent} tracked emails with ${opens} opens.`,
        actionable: false,
      });
    } else if (avgOpenRate > 0 && avgOpenRate < 20) {
      insights.push({
        type: "subject_line",
        title: "Your open rates have room to grow",
        description: `Your current open rate is ${avgOpenRate}%. Try shorter subject lines (under 7 words) and include the prospect's company name — our AI swarm can help with this.`,
        confidence: 80,
        evidence: `Based on ${totalSent} tracked emails. Industry average is 20-30%.`,
        actionable: true,
        cta: "Launch a new Swarm with 'concise subject' in the strategy",
      });
    }
  }

  // 2. Reply rate insight
  if (totalSent >= 3) {
    if (avgReplyRate >= 15) {
      insights.push({
        type: "general",
        title: "Strong reply rates — keep doing what works",
        description: `Your reply rate of ${avgReplyRate}% is exceptional. Your personalization strategy is clearly hitting the mark.`,
        confidence: 85,
        evidence: `Based on ${totalSent} emails with ${replies} replies.`,
        actionable: false,
      });
    } else if (avgReplyRate > 0 && avgReplyRate < 5) {
      insights.push({
        type: "oceano",
        title: "Boost replies with deeper psychological profiling",
        description: `Your reply rate is ${avgReplyRate}%. Campaigns using full OCEAN profiling typically achieve 2-3x higher reply rates. Try enabling the Psychologist agent for deeper prospect analysis.`,
        confidence: 75,
        evidence: "OCEAN-profiled campaigns average 11% reply rate vs 3% for generic outreach.",
        actionable: true,
        cta: "Add Psychologist agent to your next Swarm",
      });
    }
  }

  // 3. Top performing agent insight
  if (topAgent && topAgentScore >= 3) {
    const agentNames: Record<string, string> = {
      COPYWRITER: "Copywriter",
      RESEARCHER: "Researcher",
      STRATEGIST: "Strategist",
    };
    const name = agentNames[topAgent] || topAgent;
    insights.push({
      type: "agent",
      title: `${name} is your MVP agent`,
      description: `The ${name} agent has been used in ${topAgentScore} successful campaigns — contributing the most to your pipeline. Consider giving it more creative freedom in your Swarm params.`,
      confidence: 70,
      evidence: `Active in ${topAgentScore} out of ${successfulSwarms.length} successful swarms.`,
      actionable: true,
      cta: "Adjust Swarm params to boost this agent's influence",
    });
  }

  // 4. Engagement insight (clicks vs opens)
  if (opens >= 5 && clicks > 0) {
    const clickToOpenRatio = Math.round((clicks / opens) * 100);
    if (clickToOpenRatio < 10) {
      insights.push({
        type: "general",
        title: "People open but don't click — strengthen your CTA",
        description: `Only ${clickToOpenRatio}% of openers click your links. Try a more compelling call-to-action and make sure your value proposition is clear in the first two sentences.`,
        confidence: 65,
        evidence: `Based on ${opens} opens and ${clicks} clicks across ${totalCampaigns} campaigns.`,
        actionable: true,
        cta: "Ask the Strategist agent to revise your CTA approach",
      });
    }
  }

  // 5. Repeat contact insight
  if (prospectsWithRepeat >= 2) {
    insights.push({
      type: "timing",
      title: "Repeat contacts are working",
      description: `You have ${prospectsWithRepeat} prospects who've been contacted multiple times. Following up works — consider setting up automated follow-up sequences for unanswered first emails.`,
      confidence: 60,
      evidence: `Based on your prospect database with repeat contacts.`,
      actionable: true,
      cta: "Set up automated follow-ups for your campaigns",
    });
  }

  // 6. Campaign volume insight (if very few campaigns)
  if (totalCampaigns < 3 && totalCampaigns > 0) {
    insights.push({
      type: "general",
      title: "You're just getting started — build momentum",
      description: `With only ${totalCampaigns} campaign(s), you don't have enough data for deep insights yet. Launch 2-3 more swarms and Aurelius will surface personalized coaching based on your patterns.`,
      confidence: 90,
      evidence: `Minimum 5 campaigns recommended for statistically meaningful insights.`,
      actionable: true,
      cta: "Launch a new Swarm campaign",
    });
  }

  return {
    insights,
    summary: {
      totalCampaigns,
      totalEmailsSent: totalSent,
      avgOpenRate,
      avgReplyRate,
      topAgent,
      topAgentScore,
      bestTone: null, // would need campaign-level tone data
      prospectsWithRepeat,
    },
  };
}
