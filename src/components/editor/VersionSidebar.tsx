"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, GitCommit, Clock, User, Bot, ArrowLeft, RotateCcw } from "lucide-react";
import type { VersionEntry } from "@/types/editor";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface VersionSidebarProps {
  versions: VersionEntry[];
  currentVersionId?: string;
  onSelect: (version: VersionEntry) => void;
  onRestore: (version: VersionEntry) => void;
  onClose?: () => void;
}

// ─── VERSION SIDEBAR ───────────────────────────────────────────────────────────

export function VersionSidebar({
  versions,
  currentVersionId,
  onSelect,
  onRestore,
  onClose,
}: VersionSidebarProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const aiVersions = versions.filter((v) => v.branch === "ai" || !v.branch);
  const userVersions = versions.filter((v) => v.branch === "user");
  const isCurrent = (id: string) => id === currentVersionId;

  return (
    <aside className="w-72 h-full bg-card border-l border-border flex flex-col overflow-hidden shadow-inner">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-copper" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Version History
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft size={14} />
          </button>
        )}
      </div>

      {/* Branch legends */}
      <div className="px-4 py-2 flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-copper/40" /> AI ({aiVersions.length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400/40" /> User ({userVersions.length})
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* AI Branch */}
        <div className="relative">
          {/* Branch indicator line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-copper/15" />

          <div className="px-4 py-2 sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <Bot size={12} className="text-copper/60" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-copper/60">AI Branch</span>
            </div>
          </div>

          {aiVersions.map((v, idx) => (
            <div key={v.id} className="relative pl-8 pr-4">
              {/* Timeline dot */}
              <div className={`absolute left-[14px] top-4 w-2.5 h-2.5 rounded-full border-2 z-10 transition-all ${
                isCurrent(v.id)
                  ? "bg-copper border-copper shadow-[0_0_6px_rgba(255,95,95,0.5)]"
                  : "bg-muted border-border"
              }`} />

              <button
                onClick={() => {
                  setExpandedVersion(expandedVersion === v.id ? null : v.id);
                  onSelect(v);
                }}
                className={`w-full text-left py-3 pl-2 pr-1 rounded-lg mb-1 transition-all ${
                  isCurrent(v.id)
                    ? "bg-copper/5 border border-copper/10"
                    : expandedVersion === v.id
                      ? "bg-muted/50"
                      : "hover:bg-muted/30"
                }`}
              >
                {/* Commit header */}
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold ${
                    isCurrent(v.id) ? "text-copper" : "text-muted-foreground"
                  }`}>
                    {v.shortHash}
                  </span>
                  <GitCommit size={10} className="text-muted-foreground/50" />
                  <span className="flex-1 text-[10px] text-foreground/70 truncate font-medium">
                    {v.description}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
                    <Bot size={9} /> {v.author}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
                    <Clock size={9} />
                    {new Date(v.timestamp).toLocaleString([], {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {v.parentHash && (
                    <span className="text-[8px] text-muted-foreground font-mono">
                      ← {v.parentHash}
                    </span>
                  )}
                </div>

                {/* Expanded content preview */}
                <AnimatePresence>
                  {expandedVersion === v.id && (                      <motion.div
                        key={v.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap font-mono">
                            {v.content.replace(/<[^>]+>/g, "").slice(0, 200)}
                            {v.content.length > 200 ? "…" : ""}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRestore(v); }}
                            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-copper/10 text-copper text-[9px] font-bold uppercase tracking-wider hover:bg-copper/20 transition-all"
                          >
                            <RotateCcw size={10} /> Rollback to This
                          </button>
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ))}
        </div>

        {/* User Branch */}
        {userVersions.length > 0 && (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-blue-400/15" />

            <div className="px-4 py-2 sticky top-[30px] bg-card/95 backdrop-blur-sm z-10 border-t border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-blue-400/60" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/60">User Branch</span>
              </div>
            </div>

            {userVersions.map((v) => (
              <div key={v.id} className="relative pl-8 pr-4">
                <div className={`absolute left-[14px] top-4 w-2.5 h-2.5 rounded-full border-2 z-10 transition-all ${
                  isCurrent(v.id)
                    ? "bg-blue-500 border-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                    : "bg-muted border-border"
                }`} />

                <button
                  onClick={() => {
                    setExpandedVersion(expandedVersion === v.id ? null : v.id);
                    onSelect(v);
                  }}
                  className={`w-full text-left py-3 pl-2 pr-1 rounded-lg mb-1 transition-all ${
                    isCurrent(v.id)
                      ? "bg-blue-50/30 border border-blue-200/20"
                      : expandedVersion === v.id
                        ? "bg-muted/50"
                        : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold ${
                      isCurrent(v.id) ? "text-blue-500" : "text-muted-foreground"
                    }`}>
                      {v.shortHash}
                    </span>
                    <GitCommit size={10} className="text-muted-foreground/50" />
                    <span className="flex-1 text-[10px] text-foreground/70 truncate font-medium">
                      {v.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
                      <User size={9} /> {v.author}
                    </span>
                    <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
                      <Clock size={9} />
                      {new Date(v.timestamp).toLocaleString([], {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <AnimatePresence>
                    {expandedVersion === v.id && (
                      <motion.div
                        key={v.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap font-mono">
                            {v.content.replace(/<[^>]+>/g, "").slice(0, 200)}
                            {v.content.length > 200 ? "…" : ""}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRestore(v); }}
                            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
                          >
                            <RotateCcw size={10} /> Rollback to This
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {versions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <GitCommit size={24} className="text-muted-foreground/30 mb-3" />
            <p className="text-[10px] text-muted-foreground font-medium">No versions yet</p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              Versions appear when the AI generates or you edit the draft.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {versions.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/30 shrink-0">
          <p className="text-[9px] text-muted-foreground">
            <span className="font-mono font-bold text-foreground/60">{versions.length}</span> commits total
          </p>
        </div>
      )}
    </aside>
  );
}
