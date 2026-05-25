"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

type ComponentStatus = "operational" | "degraded" | "outage";

interface ComponentHealth {
  name: string;
  key: string;
  status: ComponentStatus;
  latencyMs: number | null;
  error?: string;
}

interface HealthResponse {
  overall: ComponentStatus;
  checkedAt: string;
  components: ComponentHealth[];
}

const STATUS_ICONS: Record<string, typeof Activity> = {
  api: Activity,
  database: Database,
  cache: Zap,
  storage: HardDrive,
};

const StatusBadge = ({ status }: { status: ComponentStatus }) => {
  const { t } = useTranslation();
  const config = {
    operational: { icon: Check, color: "text-emerald-500", bg: "bg-emerald-100", label: t("status.badge_operational") },
    degraded: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-100", label: t("status.badge_degraded") },
    outage: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: t("status.badge_outage") },
  }[status];

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${config.color} ${config.bg} px-2.5 py-1 rounded-full`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const PulseDot = ({ status }: { status: ComponentStatus }) => {
  const color =
    status === "operational"
      ? "rgb(16,185,129)"
      : status === "degraded"
        ? "rgb(245,158,11)"
        : "rgb(239,68,68)";

  return (
    <motion.span
      className="w-2.5 h-2.5 rounded-full inline-block"
      style={{ backgroundColor: color }}
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1) return "<1ms";
  return `${ms}ms`;
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export default function StatusPage() {
  const { locale } = useParams();
  const { t } = useTranslation();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/status/health", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HealthResponse = await res.json();
      setHealth(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const allOperational = health?.overall === "operational";
  const bannerBg = allOperational ? "rgb(16,185,129,0.1)" : health?.overall === "degraded" ? "rgb(245,158,11,0.1)" : "rgb(239,68,68,0.1)";
  const bannerText = allOperational ? t("status.operational") : health?.overall === "degraded" ? t("status.degraded") : t("status.outage");

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-extrabold">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {t("status.header_badge")}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-20">
        {/* Overall status banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {loading ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 bg-muted">
              <RefreshCw size={14} className="animate-spin text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">{t("status.checking")}</span>
            </div>
          ) : error ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 bg-red-100">
              <XCircle size={14} className="text-red-500" />
              <span className="text-sm font-semibold text-red-500">{t("status.unavailable")}</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
              style={{ backgroundColor: bannerBg }}
            >
              <PulseDot status={health?.overall ?? "operational"} />
              <span className="text-sm font-semibold" style={{ color: allOperational ? "rgb(16,185,129)" : health?.overall === "degraded" ? "rgb(245,158,11)" : "rgb(239,68,68)" }}>
                {bannerText}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {t("status.title")}
          </h1>
          <p className="text-muted-foreground">{t("status.subtitle")}</p>

          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-3">
              {t("status.last_checked")} {timeSince(lastUpdated.toISOString())}
              <button
                onClick={fetchHealth}
                className="ml-2 inline-flex items-center gap-1 text-copper hover:underline"
              >
                <RefreshCw size={10} />
                {t("status.refresh")}
              </button>
            </p>
          )}
        </motion.div>

        {/* Uptime bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{t("status.uptime")}</span>
            <span className="text-sm font-bold text-emerald-500">99.9%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("status.last_30_days")}</p>
          <div className="flex gap-1 h-3">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  backgroundColor:
                    i === 29 && health?.overall !== "operational"
                      ? health?.overall === "degraded"
                        ? "rgb(245,158,11,0.6)"
                        : "rgb(239,68,68,0.6)"
                      : "rgb(16,185,129,0.6)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Service cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded" />
                  <div>
                    <div className="h-4 w-24 bg-muted rounded mb-1" />
                    <div className="h-3 w-36 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-card rounded-2xl border border-border text-center"
          >
            <XCircle size={32} className="mx-auto mb-3 text-red-400" />
            <p className="text-sm font-semibold mb-1">{t("status.unavailable_title")}</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchHealth}
              className="text-sm font-semibold text-copper hover:underline"
            >
              {t("status.retry")}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {health?.components.map((comp, i) => {
              const Icon = STATUS_ICONS[comp.key] || Activity;
              return (
                <motion.div
                  key={comp.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comp.status === "operational"
                          ? `${formatLatency(comp.latencyMs)} ${t("status.latency")}`
                          : comp.error || t("status.error_unknown")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={comp.status} />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-card border border-border rounded-2xl"
        >
          <h2 className="text-sm font-bold mb-4">{t("status.incidents")}</h2>
          <p className="text-sm text-muted-foreground">{t("status.no_incidents")}</p>
        </motion.div>
      </div>

      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
      </footer>
    </main>
  );
}
