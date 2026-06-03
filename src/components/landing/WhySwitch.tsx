"use client";

import React from "react";
import { Layers, Users, UserCheck } from "lucide-react";

const items = [
  { icon: Layers, title: "Runs alongside your stack", desc: "MailMind doesn't replace your CRM or inbox. It orchestrates them." },
  { icon: Users, title: "Built for client work", desc: "Manage up to 20 clients, each with their own brand voice, prospects, and campaigns." },
  { icon: UserCheck, title: "Aurelius, not a bot", desc: "Your AI mentor learns your agency's style. He drafts, suggests, and guides — you decide." },
];

export const WhySwitch: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-muted/20 border-y border-border/50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          You don&apos;t need another tool. You need a smarter team.
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhySwitch;
