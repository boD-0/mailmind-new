"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown } from "lucide-react";

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    desc: "Start free, no credit card",
    color: "gray",
    borderColor: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-600",
    features: [
      { text: "1 agent per swarm", included: true },
      { text: "3 swarms/month", included: true },
      { text: "GPT-4o Mini", included: true },
      { text: "Vault access", included: false },
      { text: "War Room", included: false },
      { text: "Digital Twin", included: false },
    ],
    cta: "Start free",
    ctaStyle: "border border-border text-muted-foreground hover:border-amber-300 hover:text-foreground",
  },
  {
    name: "STARTER",
    price: "$49",
    desc: "Growing your campaigns",
    color: "blue",
    borderColor: "border-blue-300",
    badgeColor: "bg-blue-100 text-blue-600",
    popular: false,
    features: [
      { text: "2 agents per swarm", included: true },
      { text: "30 swarms/month", included: true },
      { text: "GPT-4o", included: true },
      { text: "Vault access", included: true },
      { text: "War Room", included: false },
      { text: "Digital Twin", included: false },
    ],
    cta: "Start free trial",
    ctaStyle: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  {
    name: "PROFESSIONAL",
    price: "$199",
    desc: "Full power, 14-day trial included",
    color: "amber",
    borderColor: "border-amber-400",
    badgeColor: "bg-amber-100 text-amber-600",
    popular: true,
    features: [
      { text: "4 agents per swarm", included: true },
      { text: "Unlimited swarms", included: true },
      { text: "GPT-4o", included: true },
      { text: "Vault access", included: true },
      { text: "War Room", included: true },
      { text: "Digital Twin", included: true },
    ],
    cta: "Start 14-day trial",
    ctaStyle: "bg-amber-500 hover:bg-amber-600 text-white",
  },
];

const ALL_FEATURES = [
  { name: "Agents per swarm", key: "agents" },
  { name: "Swarms/month", key: "swarms" },
  { name: "AI model", key: "model" },
  { name: "Vault", key: "vault" },
  { name: "War Room", key: "warroom" },
  { name: "Digital Twin", key: "twin" },
  { name: "Team seats", key: "seats" },
  { name: "Support", key: "support" },
];

const PLAN_VALUES: Record<string, Record<string, string | boolean>> = {
  FREE: { agents: "1", swarms: "3/mo", model: "GPT-4o Mini", vault: false, warroom: false, twin: false, seats: "1", support: "Community" },
  STARTER: { agents: "2", swarms: "30/mo", model: "GPT-4o", vault: true, warroom: false, twin: false, seats: "3", support: "Email" },
  PROFESSIONAL: { agents: "4", swarms: "Unlimited", model: "GPT-4o", vault: true, warroom: true, twin: true, seats: "10", support: "Priority" },
};

export const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const getPrice = (basePrice: string, name: string) => {
    if (name === "FREE") return "$0";
    const num = parseInt(basePrice.replace("$", ""));
    if (billing === "annual") return `$${Math.round(num * 10)}`;
    return basePrice;
  };

  const getPeriod = (name: string) => {
    if (name === "FREE") return "";
    return billing === "annual" ? "/year" : "/month";
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Simple pricing, no surprises
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare plans and find what fits your agency
          </p>
        </div>

        {/* Monthly/Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-semibold transition-all ${billing === "monthly" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${billing === "annual" ? "bg-amber-500" : "bg-gray-200"}`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${billing === "annual" ? "translate-x-9" : "translate-x-1"}`}
            />
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`text-sm font-semibold transition-all relative ${billing === "annual" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Yearly
            <span className="ml-1.5 text-[10px] text-white font-bold bg-emerald-500 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles size={10} />
              Save 20%
            </span>
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-6 bg-card relative flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? plan.borderColor + " shadow-lg shadow-amber-500/10" : "border-border hover:border-amber-300/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    <Crown size={12} />
                    Most popular
                  </span>
                </div>
              )}

              <div className={`${plan.popular ? "mt-4" : ""}`}>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 my-6">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {getPrice(plan.price, plan.name)}
                </span>
                <span className="text-sm text-muted-foreground">{getPeriod(plan.name)}</span>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <div key={feat.text} className="flex items-center gap-2.5">
                    {feat.included ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-gray-300 text-xs">—</span>
                      </div>
                    )}
                    <span className={`text-sm ${feat.included ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${plan.ctaStyle}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">Full feature comparison</h3>
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.name} className={`text-center px-5 py-3 text-xs font-bold ${p.popular ? "text-amber-600" : "text-foreground"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feat, i) => (
                  <tr key={feat.key} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                    <td className="px-5 py-3 text-sm text-foreground">{feat.name}</td>
                    {PLANS.map((p) => {
                      const val = PLAN_VALUES[p.name]?.[feat.key];
                      return (
                        <td key={p.name} className="px-5 py-3 text-center">
                          {val === true ? (
                            <Check size={16} className="text-emerald-500 mx-auto" />
                          ) : val === false ? (
                            <span className="text-muted-foreground/30">—</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-amber-600 mt-4 font-medium">
            14-day trial included with Professional — no credit card at signup
          </p>
        </div>

        {/* Aurelius Close Section */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-amber-700 text-sm font-bold">Au</span>
          </div>
          <p className="text-sm text-amber-800/60 mb-1 font-medium">Aurelius</p>
          <p className="text-base text-amber-900 max-w-md mx-auto leading-relaxed">
            &ldquo;Not sure which plan fits? I can help you figure it out.&rdquo;
          </p>
          <button className="mt-5 px-6 py-2.5 rounded-full border-2 border-amber-400 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors">
            Talk to Aurelius
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
