"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, TrendingUp, Loader2, ArrowRight, Sparkles,
  BarChart3, Target, Zap, Mail, ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";
import { getCoachingInsights } from "@/app/actions/coaching";
import type { CoachingInsight, CoachingData } from "@/app/actions/coaching";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onInsightClick?: (insight: CoachingInsight) => void;
}

// ─── Icons per insight type ─────────────────────────────────────────────────

const insightIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  subject_line: Mail,
  tone: Sparkles,
  agent: Target,
  oceano: BarChart3,
  timing: TrendingUp,
  general: Lightbulb,
};

const insightColors: Record<string, string> = {
  subject_line: "text-purple-500 bg-purple-50",
  tone: "text-amber-500 bg-amber-50",
  agent: "text-copper bg-red-50",
  oceano: "text-emerald-500 bg-emerald-50",
  timing: "text-blue-500 bg-blue-50",
  general: "text-gray-500 bg-gray-50",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function CoachingInsights({ onInsightClick }: Props) {
  const [data, setData] = useState<CoachingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCoachingInsights();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t("coaching.error") || "Could not load insights. Try launching a few campaigns first."}
        </p>
        <button
          onClick={fetchInsights}
          className="mt-2 text-[11px] text-copper hover:underline"
        >
          {t("coaching.retry") || "Retry"}
        </button>
      </div>
    );
  }

  if (data.insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl border border-dashed border-amber-200 p-6 text-center"
      >
        <Lightbulb size={20} className="mx-auto mb-2 text-amber-400" />
        <p className="text-xs font-medium text-amber-700">
          {t("coaching.empty") || "Not enough data for insights yet"}
        </p>
        <p className="text-[11px] text-amber-500 mt-1">
          {t("coaching.empty_hint") || "Launch 2-3 Swarm campaigns and Aurelius will analyze your patterns"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <Lightbulb size={14} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight">
            {t("coaching.title") || "Aurelius Coaching"}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {t("coaching.subtitle") || "Personalized insights based on your campaigns"}
          </p>
        </div>
      </div>

      {/* Summary stats pill row */}
      <div className="flex flex-wrap gap-2">
        <SummaryPill
          label={t("coaching.campaigns") || "Campaigns"}
          value={String(data.summary.totalCampaigns)}
        />
        <SummaryPill
          label={t("coaching.open_rate") || "Open Rate"}
          value={`${data.summary.avgOpenRate}%`}
        />
        <SummaryPill
          label={t("coaching.reply_rate") || "Reply Rate"}
          value={`${data.summary.avgReplyRate}%`}
        />
        {data.summary.topAgent && (
          <SummaryPill
            label={t("coaching.top_agent") || "Top Agent"}
            value={data.summary.topAgent.charAt(0) + data.summary.topAgent.slice(1).toLowerCase()}
          />
        )}
      </div>

      {/* Insights cards */}
      <div className="space-y-2">
        {data.insights.map((insight, i) => {
          const Icon = insightIcons[insight.type] || Lightbulb;
          const colorClass = insightColors[insight.type] || insightColors.general;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 3 }}
              className="bg-white rounded-xl border border-border p-3 cursor-pointer hover:border-copper/20 hover:shadow-sm transition-all group"
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg shrink-0 ${colorClass}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {insight.title}
                    </p>
                    {insight.actionable && (
                      <span className="text-[9px] bg-copper/10 text-copper px-1.5 py-0.5 rounded-full shrink-0">
                        {t("coaching.actionable") || "ACTIONABLE"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.cta && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-copper font-medium group-hover:underline">
                      {insight.cta}
                      <ArrowRight size={10} />
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/50 mt-1.5">
                    {insight.evidence} · {insight.confidence}% confidence
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary Pill ───────────────────────────────────────────────────────────

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 bg-white border border-border rounded-full px-2.5 py-1"
    >
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-bold text-foreground">{value}</span>
    </motion.div>
  );
}
