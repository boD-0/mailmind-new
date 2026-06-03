"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════
   NAV ITEMS — Tabler icons (matching HTML design)
   ════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { label: "Dashboard", icon: "ti-layout-dashboard", href: "/dashboard" },
  { label: "Campaigns", icon: "ti-mail", href: "/dashboard" },
  { label: "Prospects", icon: "ti-users", href: "/dashboard" },
  { label: "Swarm Canvas", icon: "ti-cpu", href: "/dashboard/tools" },
  { label: "Aurelius", icon: "ti-message-circle", href: "/dashboard/chat" },
  { label: "Ideas", icon: "ti-bulb", href: "/dashboard/ideas" },
  { label: "Vault", icon: "ti-shield", href: "/dashboard" },
  { label: "War Room", icon: "ti-chart-bar", href: "/dashboard/tools", proOnly: true },
];

/* ════════════════════════════════════════════════════════════
   CLIENT SWITCHER
   ════════════════════════════════════════════════════════════ */

function ClientSwitcher({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative mx-2 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left bg-[#F1EFE8] dark:bg-[#242422] border border-border/50 rounded-lg px-2.5 py-1.5 group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <span className="text-xs font-medium text-foreground truncate flex-1">
          {userName}
        </span>
        <i className={cn(
          "ti ti-chevron-down text-xs text-[#888780] transition-transform duration-200",
          open && "rotate-180"
        )} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/80 hover:bg-muted transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {userName}
                <span className="ml-auto text-[9px] text-muted-foreground">Current</span>
              </button>
              <div className="border-t border-border my-1" />
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-muted transition-colors font-medium">
                + Add client
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR NAV ITEM
   ════════════════════════════════════════════════════════════ */

function SidebarNavItem({
  item,
  isActive,
  isLocked,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  isLocked: boolean;
}) {
  const { locale } = useParams();
  const href = `/${locale}${item.href}`;

  const content = (
    <div
      className={cn(
        "relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-150 rounded-lg",
        isActive
          ? "bg-[#FAEEDA] text-[#BA7517] dark:bg-[#2C1A00] dark:text-[#FAC775] font-medium"
          : "text-[#5F5E5A] dark:text-[#B4B2A9] hover:text-[#1C1C1A] dark:hover:text-[#F1EFE8] hover:bg-[#F1EFE8] dark:hover:bg-[#242422]",
        isLocked && "opacity-40"
      )}
    >
      {/* Active indicator — amber left border */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-amber-500"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <i className={cn(item.icon, "text-sm", isActive && "text-[#BA7517] dark:text-[#FAC775]")} aria-hidden="true" />
      <span>{item.label}</span>

      {isLocked && (
        <i className="ti ti-lock ml-auto text-xs text-[#888780]" aria-hidden="true"></i>
      )}
    </div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR FOOTER
   ════════════════════════════════════════════════════════════ */

function SidebarFooter({
  userName,
  userEmail,
  userPlan,
}: {
  userName: string;
  userEmail: string;
  userPlan: string;
}) {
  const { locale } = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative border-t border-border/50 px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#FAEEDA] dark:bg-[#2C1A00] flex items-center justify-center text-[10px] font-medium text-[#633806] dark:text-[#FAC775] shrink-0">
          {userName.charAt(0).toUpperCase() + (userName.split(' ')[1]?.[0] || '').toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{userName}</p>
          <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#FAEEDA] dark:bg-[#2C1A00] text-[#BA7517] dark:text-[#FAC775] mt-0.5">
            {userPlan === 'PROFESSIONAL' ? 'PRO' : userPlan}
          </div>
        </div>
        <Link
          href={`/${locale}/dashboard/settings`}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#888780] hover:bg-[#F1EFE8] dark:hover:bg-[#242422] transition-colors"
          aria-label="Settings"
        >
          <i className="ti ti-settings text-sm" aria-hidden="true"></i>
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD SIDEBAR — MAIN EXPORT
   ════════════════════════════════════════════════════════════ */

export function DashboardSidebar() {
  const pathname = usePathname();
  const { locale } = useParams();
  const { data: session } = authClient.useSession();

  const user = session?.user as {
    name?: string;
    email?: string;
    plan?: string;
  } | undefined;
  const userName = user?.name || "Founder";
  const userEmail = user?.email || "";
  const userPlan = user?.plan || "FREE";

  // Check if a path is active — handle nested routes
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(`/${locale}${href}`);
  };

  // War Room locked for non-PRO plans
  const isWarRoomLocked = userPlan !== "PROFESSIONAL";

  return (
    <aside className="w-60 border-r border-border/50 bg-white dark:bg-[#1C1C1A] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 px-4 py-4 shrink-0">
        <span className="text-sm font-medium text-foreground tracking-tight">MailMind</span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
      </div>

      {/* Client Switcher */}
      <ClientSwitcher userName={userName} />

      {/* Navigation */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const locked = item.proOnly && isWarRoomLocked;
          return (
            <SidebarNavItem
              key={`${item.label}-${item.href}`}
              item={item}
              isActive={isActive(item.href)}
              isLocked={!!locked}
            />
          );
        })}
      </nav>

      {/* Footer — avatar + name + plan + settings */}
      <SidebarFooter
        userName={userName}
        userEmail={userEmail}
        userPlan={userPlan}
      />
    </aside>
  );
}
