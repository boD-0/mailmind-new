"use client";

import React, { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, Target, PenTool, ShieldCheck, FlaskConical, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { AgentName } from "@/types/swarm";

const AGENT_META: Record<AgentName, { icon: React.ElementType; label: string; id: string }> = {
  researcher: { icon: Search, label: "Researcher", id: "RESEARCHER" },
  psychologist: { icon: Brain, label: "Psychologist", id: "PSYCHOLOGIST" },
  strategist: { icon: Target, label: "Strategist", id: "STRATEGIST" },
  copywriter: { icon: PenTool, label: "Copywriter", id: "COPYWRITER" },
  consensus: { icon: CheckCircle2, label: "Consensus", id: "CONSENSUS" },
  approval_gate: { icon: ShieldCheck, label: "Approval Gate", id: "APPROVAL_GATE" },
  sandbox: { icon: FlaskConical, label: "Sandbox", id: "SANDBOX" },
};

export const AgentNode = memo(
  ({
    data,
  }: {
    data: {
      agent: AgentName;
      status: "idle" | "working" | "done" | "conflict";
      terminalLines?: string[];
      confidenceDelta?: number;
    };
  }) => {
    const [expanded, setExpanded] = useState(false);
    const meta = AGENT_META[data.agent] || AGENT_META.researcher;
    const Icon = meta.icon;

    const statusConfig = {
      idle: {
        border: "border-border",
        glow: "",
        dot: "bg-muted-foreground/30",
        text: "text-muted-foreground",
        label: "IDLE",
      },
      working: {
        border: "border-copper",
        glow: "shadow-[0_0_12px_rgba(255,95,95,0.25)]",
        dot: "bg-copper animate-pulse",
        text: "text-copper",
        label: "PROCESSING",
      },
      done: {
        border: "border-emerald-500",
        glow: "shadow-[0_0_8px_rgba(16,185,129,0.15)]",
        dot: "bg-emerald-500",
        text: "text-emerald-500",
        label: "COMPLETE",
      },
      conflict: {
        border: "border-red-500",
        glow: "shadow-[0_0_8px_rgba(239,68,68,0.2)]",
        dot: "bg-red-500",
        text: "text-red-500",
        label: "CONFLICT",
      },
    };

    const cfg = statusConfig[data.status];

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-card/95 backdrop-blur-md rounded-xl min-w-[220px] border ${cfg.border} ${cfg.glow} shadow-sm overflow-hidden transition-all duration-500`}
      >
        <Handle type="target" position={Position.Top} className="!bg-copper !border-none !w-2 !h-2" />

        {/* Header — terminal-style */}
        <div className="bg-muted/80 border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
              background: data.status === 'working' ? 'var(--copper)' :
                         data.status === 'done' ? '#10b981' :
                         data.status === 'conflict' ? '#ef4444' : 'var(--muted-foreground)'
            }} />
            <span className="text-[8px] font-mono font-bold text-muted-foreground/60 uppercase tracking-wider truncate">
              SYSTEM_AGENT_{AGENT_META[data.agent]?.id || "??"} // {meta.label.toUpperCase()}
            </span>
          </div>
          <span className={`text-[7px] font-mono font-bold uppercase tracking-[0.15em] ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        {/* Icon + confidence delta */}
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg transition-colors duration-500 ${
              data.status === "working"
                ? "bg-copper text-white"
                : data.status === "done"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">{meta.label}</h3>
            {data.confidenceDelta !== undefined && data.confidenceDelta > 0 && (
              <p className="text-[9px] font-mono text-emerald-500">
                +{data.confidenceDelta}% confidence
              </p>
            )}
          </div>
          {/* Expand toggle */}
          {data.terminalLines && data.terminalLines.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Terminal output (expandable) */}
        <AnimatePresence initial={false}>
          {expanded && data.terminalLines && data.terminalLines.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border bg-zinc-950 dark:bg-zinc-900 px-3 py-2.5 font-mono text-[10px] leading-relaxed space-y-0.5">
                {data.terminalLines.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground/40 shrink-0 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-emerald-400/90 break-all">{line}</span>
                  </div>
                ))}
                {data.status === "working" && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground/40 shrink-0 select-none">
                      {String((data.terminalLines?.length || 0) + 1).padStart(2, "0")}
                    </span>
                    <span className="text-copper/70 animate-pulse">▌</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Handle type="source" position={Position.Bottom} className="!bg-copper !border-none !w-2 !h-2" />
      </motion.div>
    );
  }
);

AgentNode.displayName = "AgentNode";
