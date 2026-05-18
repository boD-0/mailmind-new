import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/external/AppShell";
import { NewProjectDialog } from "@/components/external/NewProjectDialog";
import { CopperStreak } from "@/components/external/CopperStreak";
import { Iris } from "@/components/external/Iris";
import BlueprintBg from "@/components/external/BlueprintBg";

export const Route = createFileRoute("/dashboard" as never)({
  component: Dashboard,
});

function Dashboard() {
  const [newOpen, setNewOpen] = useState(false);

  // Fixed implicit 'any' type on parameter 'data'
  const handleCreate = (data: { name: string; company: string; goal: string; tone: string }) => {
};

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-8 py-10">
        <NewProjectDialog
          open={newOpen}
          onClose={() => setNewOpen(false)}
          onCreate={handleCreate}
        />
        
        <div className="space-y-12">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-end">
            <div>
              <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-3 font-mono">Live Session</div>
              <h1 className="font-display text-[44px] leading-[1.05]">
                External Dashboard.<br />
                <span className="text-cream/50 italic">Connected to core.</span>
              </h1>
            </div>
            <button
              onClick={() => setNewOpen(true)}
              className="px-6 py-4 border border-copper text-copper rounded-md text-[13px] tracking-wider uppercase flex items-center justify-between gap-3 hover:bg-copper/10 transition-colors"
            >
              New Project
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-deep p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <Iris size={40} className="mb-4 opacity-50" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-copper">Active Agents</h3>
              <p className="text-3xl font-black mt-2">4</p>
              <CopperStreak className="mt-4" />
            </div>
            <div className="glass-deep p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <BlueprintBg />
              <h3 className="text-sm font-bold uppercase tracking-widest text-copper">Success Rate</h3>
              <p className="text-3xl font-black mt-2">92%</p>
              <CopperStreak className="mt-4" />
            </div>
            <div className="glass-deep p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <BlueprintBg />
              <h3 className="text-sm font-bold uppercase tracking-widest text-copper">Projections</h3>
              <p className="text-3xl font-black mt-2">+14%</p>
              <CopperStreak className="mt-4" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
