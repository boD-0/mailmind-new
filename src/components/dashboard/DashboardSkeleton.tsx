"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/* ════════════════════════════════════════════════════════════
   STAT CARDS SKELETON (4 cards grid)
   ════════════════════════════════════════════════════════════ */

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TABLE SKELETON (for campaign list)
   ════════════════════════════════════════════════════════════ */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="min-w-[900px] rounded-3xl border border-border bg-white">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.2fr_0.9fr_0.9fr_0.8fr_0.8fr_0.9fr] gap-4 px-6 py-4 border-b border-border">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full max-w-[80px]" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-[2fr_1.2fr_0.9fr_0.9fr_0.8fr_0.8fr_0.9fr] gap-4 px-6 py-4 border-b border-border/50"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COACHING INSIGHTS SKELETON
   ════════════════════════════════════════════════════════════ */

export function CoachingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-3 space-y-2">
          <div className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN CONTENT SKELETON (only the grid below greeting/snapshot)
   ════════════════════════════════════════════════════════════ */

export function MainContentSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      {/* Campaigns table column */}
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
        <TableSkeleton rows={4} />
      </div>

      {/* Coaching column */}
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <CoachingSkeleton />
      </div>
    </div>
  );
}
