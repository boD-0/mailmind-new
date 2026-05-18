"use client";

import React from "react";
import { Search, Bell, User } from "lucide-react";

export function Header() {
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
