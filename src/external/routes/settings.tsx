import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/external/AppShell";

export const Route = createFileRoute("/settings" as never)({
  component: Settings,
});

function Settings() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="font-display text-4xl mb-8">Settings</h1>
        <div className="space-y-8">
          <section className="glass-deep p-8 rounded-2xl border border-white/5">
            <h3 className="text-[10px] uppercase tracking-widest text-copper font-bold mb-6">Account Configuration</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Authentication</span>
                  <div className="w-10 h-5 bg-copper rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-obsidian rounded-full" /></div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <div className="w-10 h-5 bg-white/10 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" /></div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
