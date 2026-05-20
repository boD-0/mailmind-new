"use client";

import React from "react";
import { Send, Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      <header className="p-10 border-b border-gray-200">
        <h2 className="text-4xl font-black tracking-tight mb-2 text-gray-900">Global Chat</h2>
        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Synchronize with the swarm</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[#ff5f5f]/20 flex items-center justify-center text-[#ff5f5f] shrink-0">
            <Bot size={16} />
          </div>
          <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 max-w-[80%] shadow-sm">
            <p className="text-sm text-gray-700">Hello! I am Aurelius, your omniscient helper. How can I assist you with your campaigns today?</p>
          </div>
        </div>
      </div>

      <div className="p-10 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            placeholder="Type a message to the swarm..." 
            className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-4 pl-6 pr-16 text-sm text-gray-800 focus:border-[#ff5f5f]/50 outline-none transition-all placeholder:text-gray-400"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ff5f5f] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
