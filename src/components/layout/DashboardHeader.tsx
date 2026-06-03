"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sun, Moon, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import SearchComponent from "@/components/ui/animated-glowing-search-bar";
import { NotificationsPopover } from "@/components/ui/notifications-popover";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { AvatarCircle } from "@/components/ui/avatar-picker";

/* ════════════════════════════════════════════════════════════
   PAGE TITLE — derived from current route
   ════════════════════════════════════════════════════════════ */

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/chat": "Aurelius",
  "/dashboard/ideas": "Ideas",
  "/dashboard/tools": "War Room",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Founder Mode",
};

function getPageTitle(pathname: string, locale: string): string {
  // Remove locale prefix
  const path = pathname.replace(`/${locale}`, "") || "/dashboard";
  return ROUTE_TITLES[path] || "Dashboard";
}

/* ════════════════════════════════════════════════════════════
   TRIAL PILL — small amber badge in the top bar
   ════════════════════════════════════════════════════════════ */

function TrialPill() {
  const { locale } = useParams();
  const { data: session } = authClient.useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const trialEndRaw = user?.trialEnd as string | null | undefined;
  const plan = (user?.plan as string) || "FREE";
  const polarSubscriptionId = user?.polarSubscriptionId as string | null | undefined;

  const now = Date.now();
  const trialEnd = trialEndRaw ? new Date(trialEndRaw).getTime() : null;
  const isTrialing =
    plan === "PROFESSIONAL" && trialEnd !== null && trialEnd > now && !polarSubscriptionId;
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)))
    : 0;

  if (!isTrialing) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <Link
      href={`/${locale}/dashboard/settings`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all hover:scale-105",
        isUrgent
          ? "bg-red-500 text-white"
          : "bg-amber-500 text-white"
      )}
    >
      {isUrgent ? (
        <Crown size={12} />
      ) : (
        <Sparkles size={12} />
      )}
      {daysRemaining}d · Upgrade
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════
   AVATAR MENU — user dropdown in top bar
   ════════════════════════════════════════════════════════════ */

function AvatarMenu() {
  const { locale } = useParams();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const user = session?.user as { name?: string; email?: string } | undefined;
  const userName = user?.name || "Founder";
  const userEmail = user?.email || "";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = `/${locale}/login`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="User menu"
      >
        <AvatarCircle size="sm" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
            <div className="py-1">
              <Link
                href={`/${locale}/dashboard/settings`}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD HEADER — MAIN EXPORT
   ════════════════════════════════════════════════════════════ */

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchFocus: () => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  onSearchFocus,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { locale } = useParams();
  const { data: session, isPending } = authClient.useSession();

  const pageTitle = getPageTitle(pathname, locale as string);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (isPending) {
    return (
      <header className="h-14 border-b border-border/50 bg-white dark:bg-[#1C1C1A] flex items-center justify-center px-6 sticky top-0 z-40">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
      </header>
    );
  }

  return (
    <header className="h-14 border-b border-border/50 bg-white dark:bg-[#1C1C1A] flex items-center justify-between px-4 xl:px-6 sticky top-0 z-40">
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-medium text-foreground tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="hidden md:block max-w-[280px] w-full mx-4">
        <SearchComponent
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={onSearchFocus}
          placeholder="Search campaigns, prospects…"
        />
      </div>

      {/* Right: Trial pill + Theme toggle + Notifications + Avatar */}
      <div className="flex items-center gap-1.5">
        <TrialPill />
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg flex items-center justify-center text-amber-500 border border-border/50 bg-[#F1EFE8] dark:bg-[#242422] hover:bg-[#FAEEDA] dark:hover:bg-[#2C1A00] transition-all text-sm"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <NotificationsPopover />
        <AvatarMenu />
      </div>
    </header>
  );
}
