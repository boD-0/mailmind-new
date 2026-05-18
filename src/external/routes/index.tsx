import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/external/AppShell";
import { Iris } from "@/components/external/Iris";

export const Route = createFileRoute("/" as never)({
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <Iris size={120} animated className="mb-8" />
        <h1 className="font-display text-6xl mb-4 text-copper">MAILMIND</h1>
        <p className="text-cream/60 max-w-md mb-12 uppercase tracking-widest text-xs font-bold">
          High-performance outreach orchestration for elite founders.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="px-8 py-3 bg-copper text-obsidian rounded-md font-bold uppercase tracking-widest text-xs hover:bg-copper-light transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-8 py-3 border border-copper text-copper rounded-md font-bold uppercase tracking-widest text-xs hover:bg-copper/10 transition-colors">
            Signup
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
