import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/external/AppShell";

export const Route = createFileRoute("/login" as never)({
  component: Login,
});

function Login() {
  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-deep p-10 rounded-2xl border border-white/5 w-full max-w-md">
          <h2 className="font-display text-3xl mb-6 text-copper text-center">Login</h2>
          <form className="space-y-6">
            <div>
              <label className="text-[10px] tracking-widest text-cream/40 uppercase font-bold">Email</label>
              <input type="email" className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-cream/40 uppercase font-bold">Password</label>
              <input type="password" className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-copper transition-colors" />
            </div>
            <button className="w-full py-4 bg-copper text-obsidian rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-copper-light transition-all shadow-[0_5px_20px_rgba(193,123,63,0.3)]">
              Enter Platform
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
