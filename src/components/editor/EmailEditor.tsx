"use client";

import React from "react";
import { Send, Sparkles } from "lucide-react";

interface EmailEditorProps {
  content: string | null;
}

export function EmailEditor({ content }: EmailEditorProps) {
  return (
    <div className="mt-4 glass-card rounded-xl border border-copper/10 overflow-hidden flex flex-col">
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Draft (Live Edit)</span>
        <div className="flex gap-2">
          <button className="p-1 hover:text-copper transition-colors">
            <Sparkles size={14} />
          </button>
        </div>
      </div>
      
      <textarea
        value={content || ""}
        placeholder="Waiting for Copywriter to generate draft..."
        className="flex-1 bg-transparent p-6 text-sm text-cream/90 min-h-[200px] outline-none resize-none custom-scrollbar leading-relaxed"
        onChange={() => {}} // Handle edit
      />

      <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
        <button 
          disabled={!content}
          className="flex items-center gap-2 px-6 py-2 bg-copper text-obsidian text-xs font-bold uppercase tracking-widest rounded-full hover:bg-copper-light transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <span>Send Outreach</span>
          <Send size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
