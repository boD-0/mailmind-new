"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, Zap, Loader2, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line,
} from "recharts";
import { useTranslation } from "@/components/I18nProvider";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CampaignAnalyticsData {
  campaignId: string;
  campaignName: string;
  replyRate: number;
  openRate: number;
  clickRate: number;
  oceano: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
  agentStats: { researcher: number; psychologist: number; strategist: number; copywriter: number };
  confidenceHistory: Array<{ date: string; score: number }>;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  campaignId?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CampaignAnalytics({ campaignId }: Props) {
  const [data, setData] = useState<CampaignAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { getCampaignAnalytics } = await import("@/app/actions/analytics");
      const result = await getCampaignAnalytics(campaignId);
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) return null;

  const selected = data[selectedIndex] ?? data[0]!;

  const oceanoData = [
    { trait: "O", value: selected.oceano.openness, fullMark: 100 },
    { trait: "C", value: selected.oceano.conscientiousness, fullMark: 100 },
    { trait: "E", value: selected.oceano.extraversion, fullMark: 100 },
    { trait: "A", value: selected.oceano.agreeableness, fullMark: 100 },
    { trait: "N", value: selected.oceano.neuroticism, fullMark: 100 },
  ];

  const agentData = [
    { name: "Researcher", score: selected.agentStats.researcher },
    { name: "Psychologist", score: selected.agentStats.psychologist },
    { name: "Strategist", score: selected.agentStats.strategist },
    { name: "Copywriter", score: selected.agentStats.copywriter },
  ];

  const engagementData = [
    { name: "Open", value: selected.openRate, fill: "#10b981" },
    { name: "Click", value: selected.clickRate, fill: "#3b82f6" },
    { name: "Reply", value: selected.replyRate, fill: "#f59e0b" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={16} className="text-copper" />
        <h3 className="text-sm font-bold tracking-tight">{t("analytics.title") || "Campaign Analytics"}</h3>
      </div>

      {/* Campaign selector */}
      {data.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {data.map((c, i) => (
            <button
              key={c.campaignId}
              onClick={() => setSelectedIndex(i)}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                i === selectedIndex
                  ? "bg-copper text-white font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.campaignName}
            </button>
          ))}
        </div>
      )}

      {/* Engagement metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("analytics.open_rate") || "Open Rate", value: `${selected.openRate}%`, icon: TrendingUp, color: "text-emerald-500" },
          { label: t("analytics.click_rate") || "Click Rate", value: `${selected.clickRate}%`, icon: Target, color: "text-blue-500" },
          { label: t("analytics.reply_rate") || "Reply Rate", value: `${selected.replyRate}%`, icon: Zap, color: "text-amber-500" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-xl border border-border p-3 text-center"
          >
            <m.icon size={14} className={`mx-auto mb-1 ${m.color}`} />
            <p className="text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engagement bar chart */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
            {t("analytics.engagement") || "Engagement"}
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={engagementData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }}
                formatter={(value: unknown) => [`${value}%`, ""]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#EF9F27" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OCEAN radar */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
            {t("analytics.ocean_profile") || "OCEAN Profile"}
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <RadarChart data={oceanoData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#EF9F27" fill="#EF9F27" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent performance */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
            {t("analytics.agent_performance") || "Agent Performance"}
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={agentData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }}
                formatter={(value: unknown) => [`${value}%`, ""]}
              />              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {agentData.map((_, index) => {
                  const colors = ["#EF9F27", "#8b5cf6", "#3b82f6", "#10b981"];
                  return <Cell key={index} fill={colors[index]} />;
                })}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence over time */}
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
            {t("analytics.confidence_trend") || "Confidence Trend"}
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={selected.confidenceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }}
                formatter={(value: unknown) => [`${value}%`, "Confidence"]}
              />
              <Line type="monotone" dataKey="score" stroke="#EF9F27" strokeWidth={2} dot={{ r: 3, fill: "#EF9F27" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
