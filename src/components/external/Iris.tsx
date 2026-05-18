"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IrisProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function Iris({ size = 48, animated = false, className }: IrisProps) {
  return (
    <div 
      className={cn("rounded-full bg-copper/20 flex items-center justify-center border border-copper/30", className)}
      style={{ width: size, height: size }}
    >
      <div className={cn(
        "rounded-full bg-copper shadow-[0_0_15px_rgba(193,123,63,0.5)]",
        animated && "animate-pulse"
      )}
      style={{ width: size / 2, height: size / 2 }}
      ></div>
    </div>
  );
}
