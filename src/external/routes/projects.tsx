import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/external/AppShell";

export const Route = createFileRoute("/projects" as never)({
  component: Projects,
});

function Projects() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="font-display text-4xl mb-8">Projects</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-deep p-6 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Project Alpha {i}</h3>
                <p className="text-xs text-cream/40 uppercase tracking-widest font-mono">Last active: 2 hours ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-copper">Processing</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
