"use client";

import React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian text-cream flex flex-col">
      {children}
    </div>
  );
}
