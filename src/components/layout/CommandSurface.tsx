"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Lightbulb, MessageSquare, Shield, Settings, LogOut, User, Loader2, FolderKanban, FileText, Wrench, Rocket, UserPlus, ChevronRight } from "lucide-react";
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
];

function Sidebar() {
  const pathname = usePathname();
  const { locale } = useParams();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white/70 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <Link href={`/${locale}/dashboard`} className="text-xl font-black tracking-tighter text-[#ff5f5f]">
          MAILMIND<span className="text-gray-300">.</span>
        </Link>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const localizedHref = `/${locale}${item.href}`;
          const isActive = pathname === localizedHref;
          return (
            <Link 
              key={item.href} 
              href={localizedHref}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-[#ff5f5f] text-white shadow-[0_5px_15px_rgba(255,95,95,0.3)]' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-200 space-y-2">
        <Link 
          href={`/${locale}/dashboard/settings`}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
            pathname === `/${locale}/dashboard/settings`
              ? 'bg-[#ff5f5f] text-white shadow-[0_5px_15px_rgba(255,95,95,0.3)]'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
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
        className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:opacity-80 transition-opacity"
      >
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {userName.split(" ")[0]}
          </p>
          <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{userEmail}</p>
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
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-black/5 overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/settings`) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={15} className="text-gray-400" />
                Settings
              </button>
              <button
                onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/settings`) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={15} className="text-gray-400" />
                Account
              </button>

              {/* Founder Mode — admin only */}
              {isAdmin && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { setOpen(false); router.push(`/${locale}/dashboard/admin`) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#ff5f5f] hover:bg-red-50 transition-colors"
                  >
                    <Shield size={15} />
                    Founder Mode
                  </button>
                </>
              )}

              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
      <header className="h-20 border-b border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center px-10 sticky top-0 z-40">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </header>
    )
  }

  return (
    <header className="h-20 border-b border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
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
    <div className="dashboard-light flex min-h-screen bg-obsidian">
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
