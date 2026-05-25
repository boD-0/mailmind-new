"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, Lock, Edit3, RotateCcw,
  GitBranch, Clock, User, Bot,
} from "lucide-react";
import type { VersionEntry } from "@/types/editor";

interface DiffLine {
  text: string;
  type: "added" | "removed" | "unchanged";
  lineNumLeft?: number;
  lineNumRight?: number;
}

interface SplitDiffViewProps {
  leftVersion: VersionEntry;
  rightVersion: VersionEntry | string; // VersionEntry or plain HTML string
  onRollback: (version: VersionEntry) => void;
  onClose: () => void;
}

// ─── DIFF ENGINE ────────────────────────────────────────────────────────────────

function computeDiff(leftHTML: string, rightHTML: string): DiffLine[] {
  const stripTags = (html: string) =>
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&emsp;/g, "\t");

  const leftLines = stripTags(leftHTML).split("\n");
  const rightLines = stripTags(rightHTML).split("\n");

  // Simple LCS-based diff
  const lcs: number[][] = Array.from({ length: leftLines.length + 1 }, () =>
    new Array<number>(rightLines.length + 1).fill(0)
  );

  for (let i = 1; i <= leftLines.length; i++) {
    for (let j = 1; j <= rightLines.length; j++) {
      if ((leftLines[i - 1] ?? "").trim() === (rightLines[j - 1] ?? "").trim()) {
        lcs[i]![j] = (lcs[i - 1]?.[j - 1] ?? 0) + 1;
      } else {
        lcs[i]![j] = Math.max(lcs[i - 1]?.[j] ?? 0, lcs[i]?.[j - 1] ?? 0);
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = [];
  let i = leftLines.length;
  let j = rightLines.length;
  let lineNumLeft = leftLines.length;
  let lineNumRight = rightLines.length;

  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && (leftLines[i - 1] ?? "").trim() === (rightLines[j - 1] ?? "").trim()) {
      temp.push({ text: leftLines[i - 1] ?? "", type: "unchanged", lineNumLeft, lineNumRight });
      i--;
      j--;
      lineNumLeft--;
      lineNumRight--;
    } else if (j > 0 && (i === 0 || (lcs[i]?.[j - 1] ?? 0) >= (lcs[i - 1]?.[j] ?? 0))) {
      temp.push({ text: rightLines[j - 1] ?? "", type: "added", lineNumRight });
      j--;
      lineNumRight--;
    } else {
      temp.push({ text: leftLines[i - 1] ?? "", type: "removed", lineNumLeft });
      i--;
      lineNumLeft--;
    }
  }

  return temp.reverse();
}

// ─── DIFF LINE ──────────────────────────────────────────────────────────────────

function DiffLineRow({ line, isLeft }: { line: DiffLine; isLeft: boolean }) {
  if (line.type === "unchanged") {
    return (
      <tr className="group">
        <td className="w-10 px-2 py-0.5 text-right text-[9px] font-mono text-muted-foreground/40 select-none border-r border-border/50">
          {isLeft ? (line.lineNumLeft ?? "") : (line.lineNumRight ?? "")}
        </td>
        <td className="pl-3 pr-2 py-0.5 text-[11px] text-foreground/70 leading-relaxed font-mono">
          {line.text || "\u00A0"}
        </td>
      </tr>
    );
  }

  if (line.type === "added" && !isLeft) {
    return (
      <tr className="bg-emerald-50/50">
        <td className="w-10 px-2 py-0.5 text-right text-[9px] font-mono text-muted-foreground/40 select-none border-r border-border/50">
          {line.lineNumRight ?? ""}
        </td>
        <td className="pl-3 pr-2 py-0.5 text-[11px] text-emerald-800 leading-relaxed font-mono bg-emerald-50/80">
          <span className="text-emerald-500 font-bold mr-2 select-none">+</span>
          {line.text || "\u00A0"}
        </td>
      </tr>
    );
  }

  if (line.type === "removed" && isLeft) {
    return (
      <tr className="bg-red-50/50">
        <td className="w-10 px-2 py-0.5 text-right text-[9px] font-mono text-muted-foreground/40 select-none border-r border-border/50">
          {line.lineNumLeft ?? ""}
        </td>
        <td className="pl-3 pr-2 py-0.5 text-[11px] text-red-800 leading-relaxed font-mono bg-red-50/80">
          <span className="text-red-500 font-bold mr-2 select-none">-</span>
          {line.text || "\u00A0"}
        </td>
      </tr>
    );
  }

  // Empty filler row for alignment
  return (
    <tr className="bg-muted/30">
      <td className="w-10 px-2 py-0.5" />
      <td className="pl-3 pr-2 py-0.5 text-[11px] leading-relaxed font-mono text-transparent select-none">
        {"\u00A0"}
      </td>
    </tr>
  );
}

// ─── SPLIT DIFF VIEW ────────────────────────────────────────────────────────────

export function SplitDiffView({ leftVersion, rightVersion, onRollback, onClose }: SplitDiffViewProps) {
  const rightContent = typeof rightVersion === "string" ? rightVersion : rightVersion.content;
  const rightLabel = typeof rightVersion === "string" ? "Current Draft" : `${rightVersion.shortHash} — ${rightVersion.description}`;

  const diffLines = useMemo(
    () => computeDiff(leftVersion.content, rightContent),
    [leftVersion.content, rightContent]
  );

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const unchangedCount = diffLines.filter((l) => l.type === "unchanged").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeftRight size={18} />
          </button>
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-copper" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">
              Version Diff
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Diff stats */}
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/20 flex items-center justify-center text-[8px] font-bold">+</span>
              {addedCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <span className="w-3 h-3 rounded-sm bg-red-500/20 flex items-center justify-center text-[8px] font-bold">-</span>
              {removedCount}
            </span>
            <span className="text-muted-foreground">{unchangedCount} unchanged</span>
          </div>

          <button
            onClick={() => onRollback(leftVersion)}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-copper text-white text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-copper/80 transition-all shadow-sm"
          >
            <RotateCcw size={12} /> Rollback to Left
          </button>
        </div>
      </header>

      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-border shrink-0">
        <div className="px-6 py-2.5 border-r border-border flex items-center gap-2 bg-muted/30">
          <Lock size={12} className="text-muted-foreground" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Historical · {leftVersion.shortHash}
            </p>
            <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
              {leftVersion.branch === "ai" ? <Bot size={10} /> : <User size={10} />}
              {leftVersion.author} ·{" "}
              {new Date(leftVersion.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="px-6 py-2.5 flex items-center gap-2 bg-muted/20">
          <Edit3 size={12} className="text-copper" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-copper">
              {typeof rightVersion === "string" ? "Current Draft" : "Selected Version"}
            </p>
            <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
              <Clock size={10} />
              {typeof rightVersion === "string" ? "Live" : rightVersion.shortHash}
            </p>
          </div>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        {/* Left: Historical (locked) */}
        <div className="overflow-y-auto custom-scrollbar border-r border-border">
          <table className="w-full border-collapse">
            <tbody>
              {diffLines.map((line, idx) => {
                // Show on left: unchanged and removed lines
                if (line.type === "added") {
                  return <DiffLineRow key={idx} line={line} isLeft={true} />;
                }
                return <DiffLineRow key={idx} line={line} isLeft={true} />;
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Current draft */}
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <tbody>
              {diffLines.map((line, idx) => {
                // Show on right: unchanged and added lines
                if (line.type === "removed") {
                  return <DiffLineRow key={idx} line={line} isLeft={false} />;
                }
                return <DiffLineRow key={idx} line={line} isLeft={false} />;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-10 border-t border-border flex items-center justify-between px-6 bg-muted/30 shrink-0">
        <span className="text-[9px] text-muted-foreground flex items-center gap-1.5">
          <GitBranch size={10} />
          Comparing {leftVersion.shortHash} → {typeof rightVersion === "string" ? "current" : rightVersion.shortHash}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {diffLines.length} lines
        </span>
      </footer>
    </motion.div>
  );
}
