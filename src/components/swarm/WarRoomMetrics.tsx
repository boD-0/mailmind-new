"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Activity, Coins, BarChart3 } from "lucide-react";
import { useSwarmStore } from "@/stores/swarmStore";

interface MetricCard {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  accent: string;
}

export function WarRoomMetrics() {
  const { status, confidenceScore, activeAgent, traceLogs } = useSwarmStore();
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Live elapsed timer
  useEffect(() => {
    if (status !== "swarm_running" && status !== "awaiting_approval") return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Calculate metrics
  const completedAgents = traceLogs.filter((l) => l.status === "done").length;
  const totalAgents = 7; // researcher, psychologist, strategist, consensus, approval_gate, copywriter, sandbox
  const agentTimes: Record<string, number> = {};
  let lastTimestamp = startTime;
  for (const log of traceLogs) {
    if (log.status === "done" || log.status === "working") {
      agentTimes[log.agent] = Math.floor((log.timestamp - lastTimestamp) / 1000);
      lastTimestamp = log.timestamp;
    }
  }

  const estimatedTokens = traceLogs.reduce((sum, l) => sum + (l.message.length * 0.75), 0);
  const estimatedCost = (estimatedTokens / 1000) * 0.01; // ~$0.01 per 1K tokens

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const metrics: MetricCard[] = [
    {
      label: "Elapsed Time",
      value: formatTime(elapsed),
      subtitle: `${completedAgents}/${totalAgents} agents`,
      icon: Clock,
      accent: "text-blue-500",
    },
    {
      label: "Consensus Score",
      value: `${confidenceScore}%`,
      subtitle: status === "consensus_reached" ? "Reached" : status === "conflict" ? "Conflict" : "Building…",
      icon: Activity,
      accent: confidenceScore >= 60 ? "text-emerald-500" : "text-copper",
    },
    {
      label: "Est. Tokens",
      value: `${Math.round(estimatedTokens).toLocaleString()}`,
      subtitle: `~$${estimatedCost.toFixed(2)} cost`,
      icon: Coins,
      accent: "text-amber-500",
    },
    {
      label: "Active Agent",
      value: activeAgent
        ? activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1).replace(/_/g, " ")
        : "—",
      subtitle: status === "swarm_running" ? "Processing" : "Idle",
      icon: BarChart3,
      accent: activeAgent ? "text-copper" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={12} className={metric.accent} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </span>
            </div>
            <p className={`text-lg font-black tabular-nums ${metric.accent}`}>
              {metric.value}
            </p>
            {metric.subtitle && (
              <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                {metric.subtitle}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
