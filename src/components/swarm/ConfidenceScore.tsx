"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfidenceScoreProps {
  value: number;
}

export function ConfidenceScore({ value }: ConfidenceScoreProps) {
  const isConsensus = value >= 100;

  const getStatusColor = () => {
    if (value >= 100) return 'text-emerald-500';
    if (value >= 85) return 'text-emerald-500/80';
    if (value >= 50) return 'text-copper';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col items-end relative">
      <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Confidence Score</span>
      
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {isConsensus && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold tracking-tighter"
            >
              CONSENSUS REACHED
            </motion.span>
          )}
        </AnimatePresence>
        
        <motion.span 
          key={value}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-2xl font-black tabular-nums ${getStatusColor()} ${isConsensus ? 'crystallize' : ''}`}
        >
          {value}%
        </motion.span>
      </div>

      {/* Progress Bar under */}
      <div className="w-32 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${isConsensus ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-copper'}`}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
