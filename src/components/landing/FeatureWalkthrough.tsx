"use client";

import React from "react";
import { Cpu, MessageCircle, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Cpu,
    title: "Create your swarm",
    desc: "Select from 4 specialized AI agents — Researcher, Psychologist, Strategist, and Copywriter. Each agent has a distinct role, and together they form a coordinated swarm that researches, profiles, strategizes, and writes your campaign.",
    visual: (
      <div className="border border-border rounded-xl bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-foreground">Swarm Canvas</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">2 agents selected</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { role: "Researcher", emoji: "🔍", color: "bg-emerald-50 border-emerald-200" },
            { role: "Strategist", emoji: "♟️", color: "bg-indigo-50 border-indigo-200" },
          ].map((agent) => (
            <div key={agent.role} className={`${agent.color} border rounded-xl p-3`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{agent.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{agent.role}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                <div className="w-3/4 h-full rounded-full bg-amber-500" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">Confidence: 87%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Aurelius drafts your campaign",
    desc: "Tell Aurelius what you need — \"Write a cold outreach for a SaaS CFO\" — and he returns a structured sequence. He knows your brand voice, target audience, and past campaigns, so every draft feels like your agency wrote it.",
    visual: (
      <div className="border border-border rounded-xl bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">Au</span>
          <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
            <p className="text-xs text-foreground leading-relaxed">
              I&apos;ve analyzed your agency&apos;s style and the SaaS CFO persona. Here&apos;s a 3-email sequence designed to start a conversation, not sell upfront.
            </p>
          </div>
        </div>
        <div className="ml-11 space-y-2">
          {["Email 1: The insight opener", "Email 2: The value add", "Email 3: The soft ask"].map((email) => (
            <div key={email} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {email}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track every result",
    desc: "Monitor open rates, reply rates, and campaign performance in real time. Aurelius highlights what's working and what needs adjustment — like a senior strategist looking over your shoulder.",
    visual: (
      <div className="border border-border rounded-xl bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-foreground">Campaign Analytics</span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            1 new reply
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Open rate", value: "44%", color: "text-emerald-600" },
            { label: "Click rate", value: "18%", color: "text-blue-600" },
            { label: "Reply rate", value: "12%", color: "text-amber-600" },
          ].map((metric) => (
            <div key={metric.label} className="bg-muted/30 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50/50 border-l-2 border-amber-400 rounded-r-xl px-3 py-2">
          <p className="text-[11px] text-amber-700/80">
            <span className="font-semibold">Aurelius:</span> Email 2 has the highest engagement. Consider A/B testing the subject line in Email 1.
          </p>
        </div>
      </div>
    ),
  },
];

export const FeatureWalkthrough: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isReversed = i === 1;
          return (
            <div
              key={step.number}
              className={`flex flex-col ${
                isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
              } gap-10 items-center mb-20 last:mb-0`}
            >
              {/* Text side */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-600 tracking-wider">
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Icon size={16} className="text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Visual side */}
              <div className="flex-1 w-full max-w-lg">{step.visual}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureWalkthrough;
