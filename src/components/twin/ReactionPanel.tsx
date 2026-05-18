"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamic imports for Recharts
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

const METRICS = [
  { key: 'curiosity',    label: 'Curiozitate',   color: 'var(--copper)' },
  { key: 'interest',     label: 'Interes',        color: '#4A8C6F' },
  { key: 'irritability', label: 'Iritabilitate',  color: 'var(--conflict-red)' },
  { key: 'trust',        label: 'Încredere',      color: '#3A5C8A' },
  { key: 'urgency_felt', label: 'Urgență',       color: '#8A6A2A' },
];

interface ReactionPanelProps {
  data: Record<string, number> | null;
  isConsensus?: boolean;
}

export function ReactionPanel({ data, isConsensus }: ReactionPanelProps) {
  const chartData = METRICS.map(m => ({
    name: m.label,
    value: data?.[m.key] || 0,
    color: m.color
  }));

  return (
    <motion.div 
      animate={isConsensus ? { filter: "brightness(1.2)" } : {}}
      className={`flex-1 flex flex-col min-w-0 ${isConsensus ? 'crystallize' : ''}`}
    >
      <div className="flex-1 min-h-[300px] w-full mt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'rgba(248, 247, 244, 0.4)', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(193, 123, 63, 0.05)' }}
              contentStyle={{ backgroundColor: 'var(--obsidian)', border: '1px solid rgba(193, 123, 63, 0.2)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--cream)', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
