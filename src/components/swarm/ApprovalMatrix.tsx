"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovalParam {
  label: string;
  key: string;
  score: number; // 0–100
  threshold: number;
  passed: boolean;
  detail?: string;
}

interface ApprovalMatrixProps {
  params: ApprovalParam[];
  overallPassed: boolean;
  confidenceScore: number;
  threshold: number;
  failedComponents?: string[];
  recommendations?: string[];
  strategistOutput?: string;
  copywriterOutput?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApprovalMatrix({
  params,
  overallPassed,
  confidenceScore,
  threshold,
  failedComponents = [],
  recommendations = [],
  strategistOutput,
  copywriterOutput,
}: ApprovalMatrixProps) {
  return (
    <div className="space-y-4">
      {/* Overall status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          overallPassed
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-red-500/5 border-red-500/20"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            overallPassed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {overallPassed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {overallPassed ? "Approval Gate — PASSED" : "Approval Gate — FAILED"}
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono">
            Confidence {confidenceScore}% {overallPassed ? "≥" : "<"} threshold {threshold}%
          </p>
        </div>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-2 gap-2">
        {params.map((param) => (
          <motion.div
            key={param.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl border ${
              param.passed
                ? "bg-emerald-500/5 border-emerald-500/10"
                : "bg-red-500/5 border-red-500/10"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                {param.label}
              </span>
              {param.passed ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : (
                <AlertTriangle size={12} className="text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(param.score, 100)}%` }}
                  className={`h-full rounded-full ${
                    param.passed ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span
                className={`text-[9px] font-mono font-bold ${
                  param.passed ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {param.score}%
              </span>
            </div>
            {param.detail && (
              <p className="text-[8px] text-muted-foreground mt-1 leading-relaxed">
                {param.detail}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Failure details — split view Strategist vs Copywriter */}
      {!overallPassed && failedComponents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border border-red-500/20 rounded-xl overflow-hidden"
        >
          <div className="bg-red-500/5 px-4 py-2 border-b border-red-500/10">
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">
              Failure Analysis
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Strategist column */}
            <div className="p-3">
              <h4 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Strategist Output
              </h4>
              <pre className="text-[10px] text-foreground/70 leading-relaxed whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">
                {strategistOutput || "No strategist output available."}
              </pre>
            </div>
            {/* Copywriter column */}
            <div className="p-3">
              <h4 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Copywriter Output
              </h4>
              <pre className="text-[10px] text-foreground/70 leading-relaxed whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">
                {copywriterOutput || "No copywriter output available."}
              </pre>
            </div>
          </div>

          {/* Failed components */}
          <div className="p-3 border-t border-red-500/10">
            <p className="text-[9px] font-bold text-red-500 mb-1.5">
              Failed: {failedComponents.join(", ")}
            </p>
            {recommendations.length > 0 && (
              <ul className="space-y-0.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="text-[9px] text-muted-foreground flex gap-1.5">
                    <span className="text-red-400 shrink-0">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
