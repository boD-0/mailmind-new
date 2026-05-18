"use client";

import React from "react";
import { Send, Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <header className="p-10 border-b border-white/5">
        <h2 className="text-4xl font-black tracking-tight mb-2">Global Chat</h2>
        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Synchronize with the swarm</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-copper shrink-0">
            <Bot size={16} />
          </div>
          <div className="glass-card p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
            <p className="text-sm text-cream/80">Hello! I am Aurelius, your omniscient helper. How can I assist you with your campaigns today?</p>
          </div>
        </div>
      </div>

      <div className="p-10 bg-obsidian/50 backdrop-blur-xl border-t border-white/5">
        <div className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            placeholder="Type a message to the swarm..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:border-copper/50 outline-none transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-copper text-obsidian rounded-xl flex items-center justify-center hover:scale-105 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
