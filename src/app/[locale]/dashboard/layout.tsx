"use client";

import { CommandSurface } from "@/components/layout/CommandSurface";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <CommandSurface>{children}</CommandSurface>;
}
