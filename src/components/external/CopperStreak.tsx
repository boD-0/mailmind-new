"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CopperStreakProps {
  className?: string;
}

export function CopperStreak({ className }: CopperStreakProps) {
  return (
    <div className={cn("w-full h-1 bg-gradient-to-r from-transparent via-copper to-transparent opacity-50", className)}></div>
  );
}
