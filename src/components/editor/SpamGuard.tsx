"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Info } from "lucide-react";

interface SpamGuardProps {
  score: number;
  flags: string[];
}

export function SpamGuard({ score, flags }: SpamGuardProps) {
  const getRiskLevel = () => {
    if (score > 60) return { label: 'High Risk', color: 'text-red-500', icon: ShieldAlert };
    if (score > 30) return { label: 'Medium Risk', color: 'text-yellow-500', icon: Info };
    return { label: 'Safe', color: 'text-emerald-500', icon: ShieldCheck };
  };

  const risk = getRiskLevel();

  return (
    <div className="glass-card p-4 rounded-xl border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <risk.icon size={16} className={risk.color} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${risk.color}`}>{risk.label}</span>
        </div>
        <span className="text-xs font-black">{score}/100</span>
      </div>

      <div className="space-y-2">
        {flags.map((flag, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-white/40">
            <span className="mt-1 w-1 h-1 rounded-full bg-white/20 shrink-0" />
            <p>{flag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
