"use client";

import React from "react";

interface NewProjectData {
  name: string;
  company: string;
  goal: string;
  tone: string;
}

interface NewProjectDialogProps {
  open?: boolean;
  onClose?: () => void;
  onCreate?: (data: NewProjectData) => void;
}

export function NewProjectDialog({ open, onClose, onCreate }: NewProjectDialogProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="p-6 bg-obsidian-mid border border-border/30 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-display text-copper mb-4">New Project</h2>
        <p className="text-sm text-cream/60 mb-6">Project Creation Stub</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={() => onCreate?.({ name: "New Project", company: "Example", goal: "Outreach", tone: "Professional" })}
            className="px-4 py-2 bg-copper text-obsidian text-xs font-bold uppercase tracking-widest rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
