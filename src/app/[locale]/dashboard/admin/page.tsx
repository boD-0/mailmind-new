"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield, Settings, Users, Database, Zap, Loader2,
  FileText, Coins, Activity,
} from "lucide-react";
import { useFounderStore } from "@/stores/founderStore";
import {
  toggleMaintenanceMode as apiToggle,
  getMaintenanceMode,
} from "@/app/actions/admin";
import { getAdminStats } from "@/app/actions/admin-stats";

interface AdminStats {
  totalSwarms: number;
  activeUsers: number;
  totalDocuments: number;
  totalTokensUsed: number;
  formattedTokens: string;
  systemHealth: string;
  recentExecutions: Array<{
    id: string;
    status: string;
    modelUsed: string | null;
    tokensUsed: number | null;
    createdAt: string;
  }>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminPage() {
  const { swarmParams, updateSwarmParams } = useFounderStore();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch maintenance state + real stats on mount
  useEffect(() => {
    Promise.all([
      getMaintenanceMode(),
      getAdminStats(),
    ]).then(([mm, s]) => {
      setMaintenanceMode(mm);
      if (s) setStats(s);
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, []);

  const handleMaintenanceToggle = useCallback(async () => {
    setToggling(true);
    const next = !maintenanceMode;
    const result = await apiToggle(next);
    if (result.success) {
      setMaintenanceMode(result.maintenance);
    }
    setToggling(false);
  }, [maintenanceMode]);

  // Use real stats if available, fall back to founderStore mock
  const displayStats = stats
    ? [
        {
          label: "Total Swarms",
          value: stats.totalSwarms.toLocaleString(),
          icon: Zap,
          color: "text-copper",
        },
        {
          label: "Active Users",
          value: stats.activeUsers.toLocaleString(),
          icon: Users,
          color: "text-blue-500",
        },
        {
          label: "Documents Stored",
          value: stats.totalDocuments.toLocaleString(),
          icon: FileText,
          color: "text-emerald-500",
        },
        {
          label: "Tokens Used",
          value: stats.formattedTokens,
          icon: Coins,
          color: "text-purple-500",
        },
      ]
    : [
        {
          label: "Total Swarms",
          value: "...",
          icon: Zap,
          color: "text-copper",
        },
        {
          label: "Active Users",
          value: "...",
          icon: Users,
          color: "text-blue-500",
        },
        {
          label: "Documents Stored",
          value: "...",
          icon: FileText,
          color: "text-emerald-500",
        },
        {
          label: "Tokens Used",
          value: "...",
          icon: Coins,
          color: "text-purple-500",
        },
      ];

  return (
    <div className="p-10 space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <Shield size={20} />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">
            Founder Mode
          </h2>
        </div>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
          Advanced Swarm Orchestration Panel
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border border-border shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 ${stat.color}`}
            >
              {statsLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <stat.icon size={20} />
              )}
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Swarm Executions */}
      {stats?.recentExecutions && stats.recentExecutions.length > 0 && (
        <section className="bg-white p-10 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-copper" />
            <h3 className="text-lg font-bold text-foreground">
              Recent Swarm Executions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-3 pr-4 font-bold">ID</th>
                  <th className="text-left py-3 pr-4 font-bold">Status</th>
                  <th className="text-left py-3 pr-4 font-bold">Model</th>
                  <th className="text-right py-3 pr-4 font-bold">Tokens</th>
                  <th className="text-right py-3 font-bold">When</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentExecutions.map((exec) => (
                  <tr key={exec.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {exec.id.slice(0, 8)}…
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          exec.status === "success"
                            ? "bg-emerald-50 text-emerald-600"
                            : exec.status === "error"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            exec.status === "success"
                              ? "bg-emerald-500"
                              : exec.status === "error"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                        {exec.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {exec.modelUsed || "—"}
                    </td>
                    <td className="py-3 pr-4 text-right text-xs font-mono text-muted-foreground">
                      {exec.tokensUsed?.toLocaleString() ?? "—"}
                    </td>
                    <td className="py-3 text-right text-xs text-muted-foreground">
                      {timeAgo(exec.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Maintenance Toggle + Swarm Params */}
      <section className="bg-white p-10 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-foreground">
          System Override
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
            <div>
              <p className="text-sm font-bold text-foreground">
                Maintenance Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Restrict access to the platform
              </p>
            </div>
            <button
              onClick={handleMaintenanceToggle}
              disabled={toggling}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                maintenanceMode ? "bg-red-500" : "bg-gray-200"
              } ${toggling ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {toggling ? (
                <Loader2
                  size={14}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white"
                />
              ) : (
                <motion.div
                  animate={{ x: maintenanceMode ? 26 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Global Tone Aggressiveness
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={swarmParams.tone_aggressiveness}
                onChange={(e) =>
                  updateSwarmParams({
                    tone_aggressiveness: parseInt(e.target.value),
                  })
                }
                className="w-full accent-copper"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>CONSERVATIVE</span>
                <span>
                  AGGRESSIVE ({swarmParams.tone_aggressiveness}/10)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Persona Strictness
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={swarmParams.persona_strictness}
                onChange={(e) =>
                  updateSwarmParams({
                    persona_strictness: parseInt(e.target.value),
                  })
                }
                className="w-full accent-copper"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>CREATIVE</span>
                <span>STRICT ({swarmParams.persona_strictness}/10)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
