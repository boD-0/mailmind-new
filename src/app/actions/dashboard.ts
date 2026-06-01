"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/gatekeeper";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { projects, swarmExecutions } from "@/db/schema";
import { eq, desc, and, isNotNull } from "drizzle-orm";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export type DashboardCampaign = {
  id: string;
  title: string;
  prospect_name: string | null;
  status: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
};

export type SwarmActivityItem = {
  id: string;
  campaign_id: string;
  campaign_title: string;
  run_index: number;
  traces: TraceEntry[];
  final_scores: Record<string, number> | null;
  created_at: string;
};

type TraceEntry = {
  agent: string;
  status: string;
  message: string;
  confidence_delta?: number;
  timestamp?: string;
};

export type DashboardDeadline = {
  id: string;
  projectName: string;
  deadline: string;
  type: "overdue" | "within_24h" | "within_7d" | "upcoming";
};

export type DashboardData = {
  campaigns: DashboardCampaign[];
  deadlines: DashboardDeadline[];
  recentActivity: SwarmActivityItem[];
  metrics: {
    totalCampaigns: number;
    avgConfidence: number;
    draftsInProgress: number;
    sentThisWeek: number;
  };
  chartData: { d: string; v: number }[];
};

// ════════════════════════════════════════════════════════════
// GET DASHBOARD DATA
// ════════════════════════════════════════════════════════════

export async function getDashboardData(): Promise<DashboardData> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);
  const supabase = await createClient();

  // ── Fetch campaigns from Supabase ──────────────────────
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("id, title, prospect_name, status, confidence_score, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (campaignsError) {
    console.error("Failed to fetch campaigns:", campaignsError);
  }

  const campaignList: DashboardCampaign[] = (campaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    prospect_name: c.prospect_name,
    status: c.status,
    confidence_score: c.confidence_score || 0,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  // ── Fetch swarm traces for activity ────────────────────
  const { data: traces, error: tracesError } = await supabase
    .from("swarm_traces")
    .select("id, campaign_id, run_index, trace_log, final_scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (tracesError) {
    console.error("Failed to fetch traces:", tracesError);
  }

  // Get campaign titles for trace context
  const campaignIds = [...new Set((traces || []).map((t: any) => t.campaign_id))];
  const campaignTitleMap: Record<string, string> = {};
  if (campaignIds.length > 0) {
    const { data: traceCampaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", campaignIds);
    (traceCampaigns || []).forEach((c: any) => {
      campaignTitleMap[c.id] = c.title;
    });
  }

  const recentActivity: SwarmActivityItem[] = (traces || []).map((t: any) => ({
    id: t.id,
    campaign_id: t.campaign_id,
    campaign_title: campaignTitleMap[t.campaign_id] || "Unknown Campaign",
    run_index: t.run_index,
    traces: Array.isArray(t.trace_log) ? t.trace_log : [],
    final_scores: t.final_scores,
    created_at: t.created_at,
  }));

  // ── Fetch deadlines from Drizzle ───────────────────────
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const userProjects = await db
    .select({ id: projects.id, name: projects.name, deadline: projects.deadline })
    .from(projects)
    .where(
      and(
        eq(projects.userId, user.id),
        isNotNull(projects.deadline),
      )
    );

  const deadlines: DashboardDeadline[] = [];
  for (const p of userProjects) {
    if (!p.deadline) continue;
    const d = new Date(p.deadline);
    let type: DashboardDeadline["type"] = "upcoming";
    if (d < now) type = "overdue";
    else if (d <= in24h) type = "within_24h";
    else if (d <= in7d) type = "within_7d";

    deadlines.push({
      id: p.id,
      projectName: p.name,
      deadline: d.toISOString(),
      type,
    });
  }

  // ── Compute weekly chart data ──────────────────────────
  // Aggregate campaigns by day of week for the past 7 days
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today7 = new Date();
  today7.setDate(today7.getDate() - 6);
  today7.setHours(0, 0, 0, 0);

  const chartData = weekDays.map((d) => ({ d, v: 0 }));
  for (const c of campaignList) {
    const cd = new Date(c.created_at);
    if (cd >= today7) {
      const dow = cd.getDay();
      const idx = chartData.findIndex((x) => x.d === weekDays[dow]);
      if (idx !== -1) chartData[idx]!.v++;
    }
  }

  // ── Compute metrics ────────────────────────────────────
  const totalCampaigns = campaignList.length;
  const confidenceScores = campaignList.filter((c) => c.confidence_score > 0);
  const avgConfidence =
    confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((s, c) => s + c.confidence_score, 0) / confidenceScores.length)
      : 0;
  const draftsInProgress = campaignList.filter(
    (c) => c.status === "draft" || c.status === "swarm_running"
  ).length;

  // Count campaigns updated this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sentThisWeek = campaignList.filter(
    (c) => c.status === "exported" && new Date(c.updated_at) >= oneWeekAgo
  ).length;

  return {
    campaigns: campaignList,
    deadlines,
    recentActivity,
    metrics: { totalCampaigns, avgConfidence, draftsInProgress, sentThisWeek },
    chartData,
  };
}

// ════════════════════════════════════════════════════════
// CREATE CAMPAIGN
// ════════════════════════════════════════════════════════

export type CreateCampaignInput = {
  title: string;
  prospect_name: string;
  prospect_url?: string;
  tone?: string;
  goal?: string;
  deadline?: string; // ISO string
};

export async function createCampaign(input: CreateCampaignInput): Promise<{ id: string }> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      title: input.title,
      prospect_name: input.prospect_name,
      prospect_url: input.prospect_url || null,
      status: "draft",
      swarm_params: {
        tone_aggressiveness: input.tone || "Direct, data-first",
      },
      confidence_score: 0,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  // Also create a project in Drizzle for deadline tracking
  if (input.deadline) {
    try {
      const deadlineDate = new Date(input.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        await db.insert(projects).values({
          userId: user.id,
          name: input.title,
          toneOfVoice: input.tone || "",
          deadline: deadlineDate,
          context: input.goal || "",
        });
      }
    } catch (err) {
      console.error("Failed to create project for deadline:", err);
    }
  }

  return { id: data.id };
}

// ════════════════════════════════════════════════════════════
// GET SWARM ACTIVITY (standalone)
// ════════════════════════════════════════════════════════════

export async function getSwarmActivity(): Promise<SwarmActivityItem[]> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);
  const supabase = await createClient();

  const { data: traces } = await supabase
    .from("swarm_traces")
    .select("id, campaign_id, run_index, trace_log, final_scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!traces?.length) return [];

  // Get campaign titles
  const campaignIds = [...new Set(traces.map((t: any) => t.campaign_id))];
  const campaignTitleMap: Record<string, string> = {};
  if (campaignIds.length > 0) {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", campaignIds);
    (campaigns || []).forEach((c: any) => {
      campaignTitleMap[c.id] = c.title;
    });
  }

  return traces.map((t: any) => ({
    id: t.id,
    campaign_id: t.campaign_id,
    campaign_title: campaignTitleMap[t.campaign_id] || "Unknown Campaign",
    run_index: t.run_index,
    traces: Array.isArray(t.trace_log) ? t.trace_log : [],
    final_scores: t.final_scores,
    created_at: t.created_at,
  }));
}
