"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Play } from "lucide-react";
import Link from "next/link";

interface ResumeBannerProps {
  show: boolean;
  activeAgent: string | null;
  campaignId: string;
  onDismiss: () => void;
}

export function ResumeBanner({ show, activeAgent, campaignId, onDismiss }: ResumeBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: -10 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -10 }}
          className="overflow-hidden"
        >
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl mx-6 mt-3 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">
                  Swarm Interrupted
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeAgent
                    ? `The swarm was paused while "${activeAgent}" was active. You can resume from where it left off.`
                    : "A previous swarm execution was interrupted. Resume to continue."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link
                href={`/dashboard/war-room/${campaignId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-copper text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all"
              >
                <Play size={12} />
                Resume
              </Link>
              <button
                onClick={onDismiss}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
