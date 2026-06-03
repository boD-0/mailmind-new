"use client";

import { CommandSurface } from "@/components/layout/CommandSurface";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <CommandSurface>
        {children}
      </CommandSurface>
    </div>
  );
}
