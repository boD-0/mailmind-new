import React from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/external/integrations/supabase/client";
import AureliusHelper from "./AureliusHelper";
import BlueprintBg from "./BlueprintBg";

export function TopNav() {
  return (
    <nav className="relative flex items-center justify-between px-6 h-16 border-b border-white/5 bg-obsidian/50 backdrop-blur-xl z-50">
      <BlueprintBg />
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-black tracking-tighter text-copper">
          MAILMIND<span className="text-white/20">.</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <AureliusHelper />
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
