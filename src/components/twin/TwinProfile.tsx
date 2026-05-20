"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DigitalTwin } from "@/types/twin";

// Import charts dynamically to avoid SSR issues and "mounted" state hacks
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then(mod => mod.RadarChart), { ssr: false });
const Radar = dynamic(() => import("recharts").then(mod => mod.Radar), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then(mod => mod.PolarAngleAxis), { ssr: false });

interface TwinProfileProps {
  profile: DigitalTwin | null;
}

export function TwinProfile({ profile }: TwinProfileProps) {
  const data = [
    { subject: 'Openness', A: profile?.ocean.openness || 0, fullMark: 100 },
    { subject: 'Conscient.', A: profile?.ocean.conscientiousness || 0, fullMark: 100 },
    { subject: 'Extraversion', A: profile?.ocean.extraversion || 0, fullMark: 100 },
    { subject: 'Agreeable.', A: profile?.ocean.agreeableness || 0, fullMark: 100 },
    { subject: 'Neuroticism', A: profile?.ocean.neuroticism || 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px] mt-6 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255, 95, 95, 0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(0, 0, 0, 0.3)', fontSize: 8, fontWeight: 700 }} 
          />
          <Radar
            name="OCEAN"
            dataKey="A"
            stroke="var(--copper)"
            fill="var(--copper)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
