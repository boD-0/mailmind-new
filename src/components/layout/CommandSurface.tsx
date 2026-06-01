"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Lightbulb, MessageSquare, Shield, Settings, LogOut, User, Loader2, FolderKanban, FileText, Wrench, Rocket, UserPlus, ChevronRight, Sparkles } from "lucide-react";
import { AureliusHelper } from "@/components/aurelius/AureliusHelper";
import { ApiLimitNotification } from "@/components/ui/api-limit-notification";
import { AvatarCircle } from "@/components/ui/avatar-picker";
import { NotificationsPopover } from "@/components/ui/notifications-popover";
import SearchComponent from "@/components/ui/animated-glowing-search-bar";
import { OmniCommandPalette, type OmniSource, type OmniItem } from "@/components/ui/omni-command-palette";
import { useSwarmNotifications } from "@/hooks/useSwarmNotifications";
import { useAvatarStore } from "@/stores/avatarStore";
import { getUserProfile } from "@/app/actions/profile";
import { searchAll } from "@/app/actions/search";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Ideas', icon: Lightbulb, href: '/dashboard/ideas' },
  { label: 'Global Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Tools', icon: Wrench, href: '/dashboard/tools' },
  { label: 'Changelog', icon: Sparkles, href: '/changelog', badge: 'NEW' },
];

function Sidebar() {
  const pathname = usePathname();
  const { locale } = useParams();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-8 border-b border-border">
        <Link href={`/${locale}/dashboard`} className="text-lg font-bold tracking-tight text-copper">
          MAILMIND<span className="text-muted-foreground/40">.</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const localizedHref = `/${locale}${item.href}`;
          const isActive = pathname === localizedHref;
          return (
            <Link 
              key={item.href} 
              href={localizedHref}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                isActive 
                  ? 'bg-primary-muted text-primary border border-primary/15' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon size={16} />
              {item.label}
              {'badge' in item && item.badge && (
                <span className="ml-auto text-[9px] font-bold bg-copper/10 text-copper px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href={`/${locale}/dashboard/settings`}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
            pathname === `/${locale}/dashboard/settings`
              ? 'bg-primary-muted text-primary border border-primary/15'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}

// ── OmniCommandPalette sources ──

const PAGE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  ideas: <Lightbulb size={16} />,
  chat: <MessageSquare size={16} />,
  admin: <Shield size={16} />,
  settings: <Settings size={16} />,
};

const PAGES_SOURCE: OmniSource = {
  id: "pages",
  label: "Pages",
  fetch: (_query: string) => {
    const pages: OmniItem[] = [
      {
        id: "page-dashboard",
        label: "Dashboard",
        subtitle: "Project overview & metrics",
        groupId: "pages",
        icon: PAGE_ICONS.dashboard,
        href: "/dashboard",
        keywords: ["home", "overview", "projects"],
        pinned: true,
      },
      {
        id: "page-ideas",
        label: "Ideas",
        subtitle: "Capture & browse campaign ideas",
        groupId: "pages",
        icon: PAGE_ICONS.ideas,
        href: "/dashboard/ideas",
        keywords: ["brainstorm", "thoughts", "campaign"],
      },
      {
        id: "page-chat",
        label: "Global Chat",
        subtitle: "Ask Aurelius anything",
        groupId: "pages",
        icon: PAGE_ICONS.chat,
        href: "/dashboard/chat",
        keywords: ["aurelius", "ai", "assistant"],
      },
      {
        id: "page-admin",
        label: "Founder Mode",
        subtitle: "Swarm orchestration & system override",
        groupId: "pages",
        icon: PAGE_ICONS.admin,
        href: "/dashboard/admin",
        keywords: ["admin", "swarm", "settings", "system"],
      },
      {
        id: "page-settings",
        label: "Settings",
        subtitle: "Profile, notifications, billing",
        groupId: "pages",
        icon: PAGE_ICONS.settings,
        href: "/dashboard/settings",
        keywords: ["profile", "preferences", "account"],
      },
    ];
    return filterItems(pages, _query);
  },
};

function filterItems(items: OmniItem[], query: string): OmniItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      i.subtitle?.toLowerCase().includes(q) ||
      i.keywords?.some((k) => k.toLowerCase().includes(q)),
  );
}

const SEARCH_SOURCE: OmniSource = {
  id: "projects",
  label: "Projects & Documents",
  minQuery: 2,
  async fetch(query: string) {
    try {
      const results = await searchAll(query);
      return results.map((r) => ({
        id: r.id,
        label: r.title,
        subtitle: r.subtitle,
        groupId: "projects",
        href: r.href,
        icon: r.type === "project" ? (
          <FolderKanban size={16} />
        ) : r.type === "document" ? (
          <FileText size={16} />
        ) : (
          <Lightbulb size={16} />
        ),
        keywords: [r.subtitle, r.tag ?? ""],
      } as OmniItem));
    } catch {
      return [];
    }
  },
};

const COMMANDS_SOURCE: OmniSource = {
  id: "commands",
  label: "Commands",
  fetch: (_query: string) => {
    const commands: OmniItem[] = [        {
        id: "cmd-new-project",
        label: "New Project",
        subtitle: "Create a new email campaign",
        groupId: "commands",
        icon: <FolderKanban size={16} />,
        href: "/dashboard",
        pinned: true,
        keywords: ["create", "campaign", "email", "add"],
      },
      {
        id: "cmd-new-idea",
        label: "New Idea",
        subtitle: "Capture a campaign idea or subject line",
        groupId: "commands",
        icon: <Lightbulb size={16} />,
        href: "/dashboard/ideas",
        keywords: ["create", "brainstorm", "thought", "subject"],
      },
      {
        id: "cmd-invite",
        label: "Invite Team Member",
        subtitle: "Copy invite link to share with a colleague",
        groupId: "commands",
        icon: <UserPlus size={16} />,
        keywords: ["share", "collaborator", "team", "access"],
        onAction: () => {
          navigator.clipboard.writeText(`${window.location.origin}/sign-up`);
          window.dispatchEvent(new CustomEvent("omni:invite-member"));
          toast.success("Invite link copied!", { description: "Share it with your team members to collaborate." });
        },
      },
      {
        id: "cmd-launch",
        label: "Launch Campaign",
        subtitle: "Activate and deploy a campaign",
        groupId: "commands",
        icon: <Rocket size={16} />,
        href: "/dashboard",
        keywords: ["deploy", "activate", "start", "send"],
      },
    ];
    return filterItems(commands, _query);
  },
};

const HEADER_SOURCES: OmniSource[] = [COMMANDS_SOURCE, PAGES_SOURCE, SEARCH_SOURCE];

function AvatarMenu() {
  const { locale } = useParams()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const userName = (session?.user as { name?: string } | undefined)?.name || "Founder"
  const userEmail = (session?.user as { email?: string } | undefined)?.email || ""

  // Check admin status
  useEffect(() => {
    import("@/app/actions/admin").then((m) =>
      m.isCurrentUserAdmin().then(setIsAdmin).catch(() => setIsAdmin(false))
    )
  }, [session])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push(`/${locale}/login`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-6 border-l border-border hover:opacity-80 transition-opacity"
      >
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {userName.split(" ")[0]}
          </p>
          <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{userEmail}</p>
        </div>
        <AvatarCircle />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/settings`) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
              >
                <Settings size={15} className="text-muted-foreground" />
                Settings
              </button>
              <button
                onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/settings`) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
              >
                <User size={15} className="text-muted-foreground" />
                Account
              </button>

              {/* Founder Mode — admin only */}
              {isAdmin && (
                <>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/admin`) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-copper hover:bg-primary-muted transition-colors"
                  >
                    <Shield size={15} />
                    Founder Mode
                  </button>
                </>
              )}

              <div className="my-1 border-t border-border" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Header() {
  const { locale } = useParams()
  const { data: session, isPending } = authClient.useSession()

  // ALL hooks first — never conditionally call hooks
  useEffect(() => {
    // Onboarding guard — redirect to /onboarding if not completed
    if (isPending) return
    if (session && !(session.user as Record<string, unknown>).onboardingComplete) {
      window.location.href = `/${locale}/onboarding`
    }
  }, [session, isPending, locale])

  useSwarmNotifications()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const initAvatar = useAvatarStore((s) => s.initAvatar)
  const avatarInitialized = useAvatarStore((s) => s.initialized)

  // Load avatar ID from DB on mount
  useEffect(() => {
    if (avatarInitialized) return;
    getUserProfile().then((data) => {
      if (data.avatarId) initAvatar(data.avatarId);
    }).catch(() => {});
  }, [initAvatar, avatarInitialized]);

  if (isPending) {
    return (
      <header className="h-20 border-b border-border bg-card flex items-center justify-center px-10 sticky top-0 z-40">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
      </header>
    )
  }

  return (
    <header className="h-20 border-b border-border bg-card flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="relative max-w-md w-full">
        <SearchComponent
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search campaigns, prospects, or ideas..."
        />
      </div>
      <OmniCommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialQuery={searchQuery}
        sources={HEADER_SOURCES}
        placeholder="Search campaigns, prospects, or ideas…"
        storageKey="mailmind:omni:recents"
        showRecents
        showPinnedFirst
        onItemExecuted={(item) => {
          console.debug("Navigated to:", item.label);
        }}
      />

      <div className="flex items-center gap-6">
        <NotificationsPopover />
        <AvatarMenu />
      </div>
    </header>
  );
}

export function CommandSurface({ children }: { children: React.ReactNode }) {
  const [apiUsage, setApiUsage] = useState(0);
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          setApiUsage(data.usagePercent || 0);
          setIsExceeded(data.isExceeded || false);
        }
      } catch {
        setApiUsage(0);
      }
    };
    checkUsage();
    const interval = setInterval(checkUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        {apiUsage > 0 && (apiUsage >= 80 || isExceeded) && (
          <div className="px-4 pt-2">
            <ApiLimitNotification
              usagePercent={apiUsage}
              isExceeded={isExceeded}
              onUpgrade={() => window.location.href = '/pricing'}
            />
          </div>
        )}
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {children}
        </motion.main>
        <AureliusHelper />
      </div>
    </div>
  );
}
