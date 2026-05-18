"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { User, Brain, Target, PenTool, Search, ShieldCheck, FlaskConical } from "lucide-react";
import { AgentName } from "@/types/swarm";

const AGENT_ICONS = {
  researcher: Search,
  psychologist: Brain,
  strategist: Target,
  copywriter: PenTool,
  consensus: User,
  approval_gate: ShieldCheck,
  sandbox: FlaskConical,
};

const AGENT_LABELS = {
  researcher: "Researcher",
  psychologist: "Psychologist",
  strategist: "Strategist",
  copywriter: "Copywriter",
  consensus: "Consensus",
  approval_gate: "Approval Gate",
  sandbox: "Sandbox",
};

export const AgentNode = memo(({ data }: { data: { agent: AgentName; status: 'idle' | 'working' | 'done' | 'conflict' } }) => {
  const agent = data.agent;
  const status = data.status;
  const Icon = AGENT_ICONS[agent] || Search;
  
  const getStatusColor = () => {
    switch (status) {
      case 'working': return 'border-copper shadow-[0_0_15px_rgba(193,123,63,0.5)]';
      case 'done': return 'border-emerald-500/50';
      case 'conflict': return 'border-red-500/50';
      default: return 'border-white/10';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`glass-card p-4 rounded-xl min-w-[180px] border ${getStatusColor()} transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} className="bg-copper border-none" />
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status === 'working' ? 'bg-copper text-obsidian animate-pulse' : 'bg-white/5 text-copper'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream">{AGENT_LABELS[agent]}</h3>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{status}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-copper border-none" />
    </motion.div>
  );
});

AgentNode.displayName = "AgentNode";
