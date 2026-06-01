"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });

const METRICS = [
  { key: "curiosity", label: "Curiosity", color: "var(--copper)" },
  { key: "interest", label: "Interest", color: "#10b981" },
  { key: "irritability", label: "Irritability", color: "#ef4444" },
  { key: "trust", label: "Trust", color: "#3b82f6" },
  { key: "urgency_felt", label: "Urgency", color: "#f59e0b" },
];

interface ReactionPanelProps {
  data: Record<string, number> | null;
  isConsensus?: boolean;
  probability?: number; // 0–100 conversion probability from Sandbox
}

export function ReactionPanel({ data, isConsensus, probability }: ReactionPanelProps) {
  const chartData = METRICS.map((m) => ({
    name: m.label,
    value: data?.[m.key] || 0,
    color: m.color,
  }));

  const hasData = data !== null && Object.values(data).some((v) => v > 0);

  return (
    <div className="space-y-3">
      {/* Probability gauge */}
      {probability !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-copper/5 border border-copper/10"
        >
          <div className="w-8 h-8 rounded-lg bg-copper/10 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-copper" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-foreground">Conversion Probability</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(probability, 100)}%` }}
                  className="h-full bg-copper rounded-full"
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-copper">
                {probability}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reaction chart */}
      <div className="flex-1 min-h-[200px] w-full min-w-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: -20, right: 10, top: 5, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 9,
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={10}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Zap size={20} className="text-muted-foreground/30 mx-auto mb-1" />
              <p className="text-[9px] text-muted-foreground/50 italic">
                Run Sandbox to see reactions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
