"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Toolbar } from "@/components/ui/toolbar";

interface EmailEditorProps {
  content: string | null;
}

export function EmailEditor({ content }: EmailEditorProps) {
  const [editorContent, setEditorContent] = useState(content || "");
  const [showToolbar, setShowToolbar] = useState(false);

  const handleToolbarAction = (action: string) => {
    console.log("Toolbar action:", action);
    // In production, this would apply formatting to the textarea selection
  };

  return (
    <div className="mt-4 glass-card rounded-xl border border-copper/10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Draft (Live Edit)</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className={`p-1.5 rounded-lg transition-all ${
              showToolbar
                ? "bg-copper/20 text-copper"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
            aria-label="Toggle formatting toolbar"
          >
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar (collapsible) */}
      {showToolbar && (
        <div className="px-3 py-2 bg-white/[0.02] border-b border-white/5 overflow-x-auto">
          <Toolbar onAction={handleToolbarAction} className="mx-auto w-fit" />
        </div>
      )}

      {/* Editor textarea */}
      <textarea
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        placeholder="Waiting for Copywriter to generate draft..."
        className="flex-1 bg-transparent p-6 text-sm text-cream/90 min-h-[200px] outline-none resize-none custom-scrollbar leading-relaxed"
      />

      {/* Bottom bar */}
      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editorContent && (
            <span className="text-[10px] text-white/30 font-mono">
              {editorContent.length} chars
            </span>
          )}
        </div>
        <button
          disabled={!editorContent.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-copper text-obsidian text-xs font-bold uppercase tracking-widest rounded-full hover:bg-copper-light transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <span>Send Outreach</span>
          <Send size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
