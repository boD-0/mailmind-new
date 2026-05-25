"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Eye, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import { getEmailTrackingStats, type EmailTrackingStats } from "@/app/actions/email-tracking";
import { useTranslation } from "@/components/I18nProvider";

interface Props {
  campaignId?: string;
}

export function EmailTrackingPanel({ campaignId }: Props) {
  const [stats, setStats] = useState<EmailTrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmailTrackingStats(campaignId);
      setStats(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      label: t("email_tracking.sent"),
      value: stats.totalSent.toLocaleString(),
      icon: Mail,
      color: "text-copper",
      bg: "bg-copper/10",
    },
    {
      label: t("email_tracking.opens"),
      value: `${stats.uniqueOpens.toLocaleString()} (${stats.openRate}%)`,
      icon: Eye,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: t("email_tracking.clicks"),
      value: `${stats.uniqueClicks.toLocaleString()} (${stats.clickRate}%)`,
      icon: MousePointerClick,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("email_tracking.engagement"),
      value: stats.totalSent > 0 ? `${stats.openRate}%` : "—",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-copper" />
        <h3 className="text-sm font-bold tracking-tight">{t("email_tracking.title")}</h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl border border-border p-3 space-y-1"
          >
            <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}>
              <m.icon size={14} className={m.color} />
            </div>
            <p className="text-lg font-bold tracking-tight text-foreground">{m.value}</p>
            <p className="text-[11px] text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Events */}
      {stats.recentEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-3">
            {t("email_tracking.recent")}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.recentEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0"
              >
                <span
                  className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                    event.eventType === "open"
                      ? "bg-emerald-500"
                      : event.eventType === "click"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                  }`}
                />
                <span className="font-medium capitalize text-foreground">{event.eventType}</span>
                <span className="text-muted-foreground truncate">
                {typeof event.metadata === "object" && event.metadata
                  ? String((event.metadata as Record<string, unknown>)?.recipientEmail ?? event.recipientEmail)
                  : event.recipientEmail}
                </span>
                <span className="ml-auto text-muted-foreground/60 shrink-0">
                  {new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
