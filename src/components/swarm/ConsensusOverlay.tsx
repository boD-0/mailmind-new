"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ConsensusOverlayProps {
  show: boolean;
}

export function ConsensusOverlay({ show }: ConsensusOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="glass-card p-12 rounded-[3rem] border-2 border-emerald-500/50 flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(16,185,129,0.2)] crystallize bg-obsidian/80 backdrop-blur-2xl">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tighter text-emerald-500 mb-2">CONSENSUS REACHED</h2>
              <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-bold">Campaign Strategy Validated</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
