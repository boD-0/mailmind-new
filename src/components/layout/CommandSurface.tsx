"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Lightbulb, MessageSquare, Shield, Settings, FolderKanban, FileText, Rocket, UserPlus } from "lucide-react";
import { AureliusHelper } from "@/components/aurelius/AureliusHelper";
import { ApiLimitNotification } from "@/components/ui/api-limit-notification";
import { OmniCommandPalette, type OmniSource, type OmniItem } from "@/components/ui/omni-command-palette";
import { useSwarmNotifications } from "@/hooks/useSwarmNotifications";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { searchAll } from "@/app/actions/search";
import { authClient } from "@/lib/auth/auth-client";
import { useAvatarStore } from "@/stores/avatarStore";
import { getUserProfile } from "@/app/actions/profile";
import { toast } from "sonner";

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

export function CommandSurface({ children }: { children: React.ReactNode }) {
  const { locale } = useParams();
  const { data: session, isPending } = authClient.useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [apiUsage, setApiUsage] = useState(0);
  const [isExceeded, setIsExceeded] = useState(false);
  const initAvatar = useAvatarStore((s) => s.initAvatar);
  const avatarInitialized = useAvatarStore((s) => s.initialized);

  // Onboarding guard
  useEffect(() => {
    if (isPending) return;
    if (session && !(session.user as Record<string, unknown>).onboardingComplete) {
      window.location.href = `/${locale}/onboarding`;
    }
  }, [session, isPending, locale]);

  // Load avatar once
  useEffect(() => {
    if (avatarInitialized) return;
    getUserProfile()
      .then((data) => {
        if (data.avatarId) initAvatar(data.avatarId);
      })
      .catch(() => {});
  }, [initAvatar, avatarInitialized]);

  // Swarm notifications
  useSwarmNotifications();

  // API usage polling
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
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchFocus={() => setSearchOpen(true)}
        />
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
