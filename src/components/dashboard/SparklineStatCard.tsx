"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ════════════════════════════════════════════════════════════
   SPARKLINE SVG
   ════════════════════════════════════════════════════════════ */

function Sparkline({ data, width = 60, height = 24, color = "#EF9F27" }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = points
    .map((point, i) => (i === 0 ? `M${point}` : `L${point}`))
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={pathD} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   SPARKLINE STAT CARD — matching HTML dashboard design
   ════════════════════════════════════════════════════════════ */

interface SparklineStatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sparklineData?: number[];
  badge?: { text: string; color: string };
  nearLimit?: boolean;
  className?: string;
}

export function SparklineStatCard({
  label,
  value,
  trend = "neutral",
  trendLabel,
  sparklineData,
  badge,
  nearLimit = false,
  className,
}: SparklineStatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl p-4 flex flex-col justify-between",
        className
      )}
    >
      {/* Label row */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] uppercase tracking-[0.4px] text-[#888780] font-medium">
          {label}
        </p>
        {sparklineData && (
          <div className="ml-2 shrink-0 opacity-70">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>

      {/* Value row */}
      <div className="mt-2">
        <span
          className={cn(
            "text-[22px] font-medium text-[#1C1C1A] dark:text-[#F1EFE8] leading-none",
            nearLimit && "text-amber-600 dark:text-amber-400"
          )}
        >
          {value}
        </span>
      </div>

      {/* Trend / sub row */}
      <div className="mt-2 flex items-center gap-1">
        {TrendIcon && trend === "up" && (
          <TrendingUp size={11} className="text-[#1D9E75] dark:text-[#5DCAA5]" />
        )}
        {TrendIcon && trend === "down" && (
          <TrendingDown size={11} className="text-[#E24B4A] dark:text-[#F09595]" />
        )}
        <span className={cn(
          "text-[11px]",
          trend === "up" ? "text-[#1D9E75] dark:text-[#5DCAA5]" :
          trend === "down" ? "text-[#E24B4A] dark:text-[#F09595]" :
          "text-[#888780]"
        )}>
          {trendLabel}
        </span>
        {badge && (
          <span className={cn("ml-1 text-[11px]", badge.color)}>
            {badge.text}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   SKELETON VARIANT
   ════════════════════════════════════════════════════════════ */

export function SparklineStatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-12 rounded" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
