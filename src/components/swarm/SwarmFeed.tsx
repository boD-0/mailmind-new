"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentMessage } from "@/types/swarm";

interface SwarmFeedProps {
  logs: AgentMessage[];
}

export function SwarmFeed({ logs }: SwarmFeedProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {logs.length === 0 ? (
          <div className="text-[10px] text-muted-foreground/50 italic text-center mt-10">
            Awaiting agent broadcast...
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div 
              key={`${log.timestamp}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 text-[11px]"
            >
              <span className="text-copper font-mono opacity-50 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="flex flex-col">
                <span className={`font-black uppercase text-[9px] mb-0.5 ${
                  log.status === 'done' ? 'text-emerald-500' : 
                  log.status === 'conflict' ? 'text-red-500' : 'text-copper/60'
                }`}>
                  {log.agent}
                </span>
                <p className="text-foreground/80 leading-relaxed">{log.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
