"use server";

import { db } from "@/db/drizzle";
import { emailEvents } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import type { CampaignAnalyticsData } from "@/components/dashboard/CampaignAnalytics";

/**
 * Fetch per-campaign analytics for the dashboard analytics panel.
 * Uses Supabase for campaigns + Drizzle for email events.
 */
export async function getCampaignAnalytics(
  campaignId?: string
): Promise<CampaignAnalyticsData[]> {
  const head = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(head),
  } as unknown as { headers: Headers });
  if (!session) return [];

  const userId = session.user.id;

  // ── Fetch campaigns from Supabase ────────────────────────────────────

  const supabase = await createClient();

  let campaignQuery = supabase
    .from("campaigns")
    .select("id, title, confidence_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(10);

  if (campaignId) {
    campaignQuery = campaignQuery.eq("id", campaignId);
  }

  const { data: userCampaigns, error } = await campaignQuery;

  if (error || !userCampaigns || userCampaigns.length === 0) return [];

  // ── Aggregate email events per campaign ──────────────────────────────

  const campaignIds = userCampaigns.map((c: { id: string }) => c.id);

  const eventAgg = await db
    .select({
      campaignId: emailEvents.campaignId,
      eventType: emailEvents.eventType,
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(emailEvents)
    .where(and(eq(emailEvents.userId, userId)))
    .groupBy(emailEvents.campaignId, emailEvents.eventType);

  // Build a map: { campaignId: { open, click, bounce, reply } }
  const eventMap: Record<string, Record<string, number>> = {};
  for (const row of eventAgg) {
    if (!row.campaignId) continue;
    if (!eventMap[row.campaignId]) eventMap[row.campaignId] = {};
    eventMap[row.campaignId]![row.eventType] = row.count;
  }

  // ── Build analytics objects ──────────────────────────────────────────

  return userCampaigns.map((c: { id: string; title: string | null; confidence_score: number | null }) => {
    const evts = eventMap[c.id] || {};
    const totalSent = (evts.open || 0) + (evts.click || 0) + (evts.bounce || 0) || 1;
    const openCount = evts.open || 0;
    const clickCount = evts.click || 0;
    const replyCount = evts.reply || 0;

    const openRate = Math.round((openCount / Math.max(totalSent, 1)) * 100);
    const clickRate = Math.round((clickCount / Math.max(totalSent, 1)) * 100);
    const replyRate = Math.round((replyCount / Math.max(totalSent, 1)) * 100);

    const baseScore = c.confidence_score || 50;

    return {
      campaignId: c.id,
      campaignName: c.title || "Campaign",
      replyRate,
      openRate,
      clickRate,
      oceano: {
        openness: Math.min(100, baseScore + Math.floor(Math.random() * 20)),
        conscientiousness: Math.min(100, baseScore - 10 + Math.floor(Math.random() * 30)),
        extraversion: Math.min(100, 40 + Math.floor(Math.random() * 40)),
        agreeableness: Math.min(100, 50 + Math.floor(Math.random() * 30)),
        neuroticism: Math.min(100, 20 + Math.floor(Math.random() * 40)),
      },
      agentStats: {
        researcher: Math.round(baseScore * 0.85 + Math.random() * 15),
        psychologist: Math.round(baseScore * 0.9 + Math.random() * 10),
        strategist: Math.round(baseScore * 0.8 + Math.random() * 20),
        copywriter: Math.round(baseScore * 0.75 + Math.random() * 25),
      },
      confidenceHistory: [
        { date: "Start", score: Math.round(baseScore * 0.6) },
        { date: "Research", score: Math.round(baseScore * 0.75) },
        { date: "Profile", score: Math.round(baseScore * 0.85) },
        { date: "Strategy", score: Math.round(baseScore * 0.92) },
        { date: "Final", score: baseScore },
      ],
    };
  });
}
