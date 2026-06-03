"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, TrendingUp, Mail, Users, MessageCircle } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="min-h-[90vh] flex items-center pt-24 pb-16 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        {/* Left: Copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
            <TrendingUp size={14} />
            10x your agency output
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Your agency.{" "}
            <span className="text-amber-500">At 10x output.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            Built for agencies that already have tools — MailMind works alongside them, not instead of them.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-7 py-6 h-auto text-base font-semibold gap-2">
              <Play size={18} />
              Watch the demo
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full px-7 py-6 h-auto text-base">
              Start free, no card needed
              <ArrowRight size={16} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Trusted by 200+ agencies in 18 countries
          </p>
        </div>

        {/* Right: Dashboard Mockup */}
        <div className="relative">
          {/* Mockup card */}
          <div className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
            {/* Mac-style top bar */}
            <div className="flex items-center gap-1.5 px-4 h-10 bg-muted/50 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[11px] text-muted-foreground font-medium">Dashboard — MailMind</span>
            </div>

            {/* Mockup content */}
            <div className="p-4 space-y-4">
              {/* Top bar mockup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 text-xs font-bold">M</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">Campaigns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">Au</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Active", value: "12", color: "text-amber-600" },
                  { label: "Swarms", value: "8/30", color: "text-blue-600" },
                  { label: "Prospects", value: "847", color: "text-emerald-600" },
                  { label: "Reply", value: "24%", color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Campaign list mockup */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                  <span className="w-1/3">Campaign</span>
                  <span className="w-1/6 text-center">Status</span>
                  <span className="w-1/6 text-center">Open</span>
                  <span className="w-1/6 text-center">Reply</span>
                </div>
                {[
                  { name: "SaaS CFOs Q4", status: "Active", open: "44%", reply: "12%", color: "bg-emerald-100 text-emerald-700" },
                  { name: "Agency Retainers", status: "Draft", open: "—", reply: "—", color: "bg-amber-100 text-amber-700" },
                  { name: "E-commerce Q1", status: "Active", open: "38%", reply: "18%", color: "bg-emerald-100 text-emerald-700" },
                ].map((camp) => (
                  <div key={camp.name} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="w-1/3 text-xs font-medium text-foreground">{camp.name}</span>
                    <span className={`w-1/6 text-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${camp.color}`}>{camp.status}</span>
                    <span className="w-1/6 text-center text-xs text-muted-foreground">{camp.open}</span>
                    <span className="w-1/6 text-center text-xs text-muted-foreground">{camp.reply}</span>
                  </div>
                ))}
              </div>

              {/* Swarm usage bar */}
              <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Swarm usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="w-2/3 h-full rounded-full bg-amber-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground">67%</span>
                </div>
              </div>

              {/* Aurelius insight */}
              <div className="border-l-2 border-amber-400 bg-amber-50/50 rounded-r-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-700">Au</span>
                  <span className="text-[10px] font-medium text-amber-800">Aurelius</span>
                </div>
                <p className="text-[11px] text-amber-700/80 leading-relaxed">
                  Campaign &quot;SaaS CFOs Q4&quot; has a 44% open rate but 0% replies. Try softening the CTA.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -top-6 -right-6 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
