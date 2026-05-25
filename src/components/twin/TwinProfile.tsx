"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Brain, Target, Shield, Zap } from "lucide-react";
import { DigitalTwin } from "@/types/twin";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then((mod) => mod.RadarChart), { ssr: false });
const Radar = dynamic(() => import("recharts").then((mod) => mod.Radar), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then((mod) => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then((mod) => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import("recharts").then((mod) => mod.PolarRadiusAxis), { ssr: false });

interface TwinProfileProps {
  profile: DigitalTwin | null;
}

const OCEAN_LABELS: Record<string, string> = {
  openness: "Openness",
  conscientiousness: "Conscient.",
  extraversion: "Extraversion",
  agreeableness: "Agreeable.",
  neuroticism: "Neuroticism",
};

export function TwinProfile({ profile }: TwinProfileProps) {
  const ocean = profile?.ocean;
  const signals = profile?.custom_signals;
  const confidence = profile?.confidence ?? 0;

  const chartData = ocean
    ? Object.entries(ocean).map(([key, value]) => ({
        subject: OCEAN_LABELS[key] || key,
        value,
        fullMark: 100,
      }))
    : [
        { subject: "Openness", value: 0, fullMark: 100 },
        { subject: "Conscient.", value: 0, fullMark: 100 },
        { subject: "Extraversion", value: 0, fullMark: 100 },
        { subject: "Agreeable.", value: 0, fullMark: 100 },
        { subject: "Neuroticism", value: 0, fullMark: 100 },
      ];

  // Signal badges
  const signalBadges = signals
    ? [
        { icon: Target, label: "Tone", value: signals.communication_tone },
        { icon: Zap, label: "Speed", value: signals.decision_speed },
        { icon: Shield, label: "Maturity", value: signals.industry_maturity },
        { icon: Brain, label: "Activity", value: signals.linkedin_activity },
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Confidence badge */}
      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              className="h-full bg-copper rounded-full"
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-copper shrink-0">
            {confidence}% match
          </span>
        </motion.div>
      )}

      {/* OCEAN Radar */}
      <div className="w-full h-[240px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="var(--border)" strokeOpacity={0.4} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 9,
                fontWeight: 600,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 8, fill: "var(--muted-foreground)", opacity: 0.5 }}
              axisLine={false}
              tickCount={3}
            />
            <Radar
              name="OCEAN"
              dataKey="value"
              stroke="var(--copper)"
              fill="var(--copper)"
              fillOpacity={0.25}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Signal badges */}
      {signalBadges.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {signalBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted border border-border"
              >
                <Icon size={10} className="text-copper shrink-0" />
                <div className="min-w-0">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wider font-bold">
                    {badge.label}
                  </p>
                  <p className="text-[9px] font-bold text-foreground capitalize truncate">
                    {String(badge.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!profile && (
        <div className="py-8 text-center">
          <Brain size={28} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground italic">
            Awaiting Psychologist synthesis…
          </p>
        </div>
      )}
    </div>
  );
}
