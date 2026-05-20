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
      case 'working': return 'border-[#ff5f5f] shadow-[0_0_15px_rgba(255,95,95,0.3)]';
      case 'done': return 'border-emerald-500';
      case 'conflict': return 'border-red-500';
      default: return 'border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-white/90 backdrop-blur-md p-4 rounded-xl min-w-[180px] border shadow-sm ${getStatusColor()} transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} className="bg-[#ff5f5f] border-none" />
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status === 'working' ? 'bg-[#ff5f5f] text-white animate-pulse' : 'bg-gray-100 text-[#ff5f5f]'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{AGENT_LABELS[agent]}</h3>
          <p className="text-[10px] uppercase tracking-wider text-gray-400">{status}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-[#ff5f5f] border-none" />
    </motion.div>
  );
});

AgentNode.displayName = "AgentNode";
