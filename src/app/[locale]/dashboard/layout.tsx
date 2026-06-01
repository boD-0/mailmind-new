"use client";

import { CommandSurface } from "@/components/layout/CommandSurface";
import { TrialBanner } from "@/components/dashboard/TrialBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <CommandSurface>
        <TrialBanner />
        {children}
      </CommandSurface>
    </div>
  );
}
