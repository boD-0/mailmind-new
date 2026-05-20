"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, User, LayoutDashboard, Lightbulb, MessageSquare, Shield, Settings, LogOut } from "lucide-react";
import { AureliusHelper } from "@/components/aurelius/AureliusHelper";
import { ApiLimitNotification } from "@/components/ui/api-limit-notification";

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Ideas', icon: Lightbulb, href: '/dashboard/ideas' },
  { label: 'Global Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Founder Mode', icon: Shield, href: '/dashboard/admin' },
];

function Sidebar() {
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

function Header() {
  return (
    <header className="h-20 border-b border-white/5 bg-obsidian/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
        <input 
          type="text" 
          placeholder="Search campaigns, prospects, or ideas..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-xs focus:border-copper/50 outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-white/40 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-copper rounded-full border-2 border-obsidian" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Founder</p>
            <p className="text-xs font-bold">Alex Iancu</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-copper to-burgundy-mid border border-white/20 flex items-center justify-center overflow-hidden">
            <User size={20} className="text-white/40" />
          </div>
        </div>
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
    <div className="flex min-h-screen bg-obsidian">
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
