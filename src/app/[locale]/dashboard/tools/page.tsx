"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown, ArrowLeft, FlaskConical, Layers, Send, Download, Sparkles,
} from "lucide-react";
import { SpecialTools } from "@/components/tools/SpecialTools";
import { authClient } from "@/lib/auth/auth-client";
import { User } from "@/db/schema";
import { Plan } from "@/lib/auth/gatekeeper";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── UPGRADE GATE ─────────────────────────────────────────────────────────────

function UpgradeGate({ plan }: { plan: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center max-w-md px-8"
      >
        <div className="w-20 h-20 rounded-xl bg-copper flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Crown size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-3">
          War Room Tools
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Special tools (A/B Test, Sequence Builder, Send Test, Export) are exclusive to{" "}
          <span className="font-bold text-foreground/80">PROFESSIONAL</span> plan subscribers.
        </p>
        <div className="bg-muted border border-border rounded-xl p-4 mb-8 text-left">
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
            <Crown size={14} /> Your Plan: {plan}
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">— A/B Subject Line Testing</li>
            <li className="flex items-center gap-2">— Sequence Builder</li>
            <li className="flex items-center gap-2">— Send Test Email</li>
            <li className="flex items-center gap-2">— Campaign Export</li>
          </ul>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-copper text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
        >
          <Crown size={18} /> Upgrade to PROFESSIONAL
        </Link>
      </motion.div>
    </div>
  );
}

// ─── TOOLS PAGE ───────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const { locale } = useParams();
  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";

  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-copper transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-3 font-mono flex items-center gap-2">
              <Sparkles size={12} /> War Room Tools
            </div>
            <h1 className="font-display text-[40px] leading-[1.05] text-foreground">
              {greeting}, Founder.<br />
              <span className="text-muted-foreground italic text-[20px]">Your toolbelt is ready.</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-muted rounded-2xl border border-border">
            <div className="flex -space-x-1.5">
              {[FlaskConical, Layers, Send, Download].map((Icon, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm"
                >
                  <Icon size={12} className="text-muted-foreground" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">4 Tools Active</span>
          </div>
        </div>
      </motion.div>

      {/* Gate or Content */}
      {userPlan !== "PROFESSIONAL" ? (
        <UpgradeGate plan={userPlan} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Quick-jump row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              { label: "A/B Test", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
              { label: "Sequence Builder", icon: Layers, color: "bg-blue-100 text-blue-600" },
              { label: "Send Test", icon: Send, color: "bg-emerald-100 text-emerald-600" },
              { label: "Export Campaign", icon: Download, color: "bg-amber-100 text-amber-600" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-[9px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm"
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${t.color}`}>
                    <Icon size={10} />
                  </div>
                  {t.label}
                </span>
              );
            })}
          </div>

          {/* Unified SpecialTools panel */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
            <SpecialTools />
          </div>
        </motion.div>
      )}
    </div>
  );
}
