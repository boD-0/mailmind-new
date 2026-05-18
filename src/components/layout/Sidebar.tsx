"use client";

import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Lightbulb, 
  MessageSquare, 
  Shield, 
  Settings,
  LogOut
} from "lucide-react";
import { usePathname, useParams } from "next/navigation";

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Ideas', icon: Lightbulb, href: '/dashboard/ideas' },
  { label: 'Global Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Founder Mode', icon: Shield, href: '/dashboard/admin' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { locale } = useParams();

  return (
    <aside className="w-64 border-r border-white/5 bg-obsidian/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <Link href={`/${locale}/dashboard`} className="text-xl font-black tracking-tighter text-copper">
          MAILMIND<span className="text-white/20">.</span>
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
                  ? 'bg-copper text-obsidian shadow-[0_5px_15px_rgba(193,123,63,0.3)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all">
          <Settings size={16} />
          Settings
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-500/60 hover:bg-red-500/5 hover:text-red-500 transition-all">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
