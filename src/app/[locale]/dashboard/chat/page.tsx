"use client";

import React from "react";
import { Send, Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <header className="p-10 border-b border-border">
        <h2 className="text-4xl font-black tracking-tight mb-2 text-foreground">Global Chat</h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Synchronize with the swarm</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-copper shrink-0">
            <Bot size={16} />
          </div>
          <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-border max-w-[80%] shadow-sm">
            <p className="text-sm text-foreground/80">Hello! I am Aurelius, your omniscient helper. How can I assist you with your campaigns today?</p>
          </div>
        </div>
      </div>

      <div className="p-10 bg-white/80 backdrop-blur-xl border-t border-border">
        <div className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            placeholder="Type a message to the swarm..." 
            className="w-full bg-muted border border-border rounded-2xl py-4 pl-6 pr-16 text-sm text-foreground focus:border-copper/50 outline-none transition-all placeholder:text-muted-foreground"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-copper text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
