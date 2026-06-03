"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, TrendingUp, Target, Users, MessageSquare } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

type MessageRole = "aurelius" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/* ════════════════════════════════════════════════════════════
   SUGGESTED PROMPTS
   ════════════════════════════════════════════════════════════ */

const SUGGESTED_PROMPTS = [
  { text: "Review my latest campaign", icon: TrendingUp },
  { text: "Suggest 5 prospects", icon: Users },
  { text: "Write a follow-up sequence", icon: MessageSquare },
  { text: "Analyze my reply rates", icon: Target },
];

/* ════════════════════════════════════════════════════════════
   INITIAL MESSAGE
   ════════════════════════════════════════════════════════════ */

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "aurelius",
  content: "Good morning. I noticed Campaign 'SaaS Q4' hasn't had new prospects in 6 days — want to revisit the targeting?",
  timestamp: new Date(),
};

/* ════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
   ════════════════════════════════════════════════════════════ */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAurelius = message.role === "aurelius";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isAurelius ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      {isAurelius ? (
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
          Au
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-xs font-bold shrink-0">
          U
        </div>
      )}

      <div className={`max-w-[75%] ${isAurelius ? "" : "items-end flex flex-col"}`}>
        {/* Name */}
        <p className="text-[11px] text-muted-foreground mb-1 font-medium">
          {isAurelius ? "Aurelius" : "You"}
        </p>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAurelius
              ? "bg-muted/50 text-foreground rounded-tl-none border border-border/50"
              : "bg-amber-500 text-white rounded-tr-none"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp (hover) */}
        <p className="text-[10px] text-muted-foreground/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   TYPING INDICATOR
   ════════════════════════════════════════════════════════════ */

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
        Au
      </div>
      <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3 border border-border/50">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500/60"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   CONTEXT PANEL
   ════════════════════════════════════════════════════════════ */

function ContextPanel() {
  return (
    <aside className="w-[35%] min-w-[280px] bg-muted/20 border-l border-border/50 p-6 overflow-y-auto hidden lg:block">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Context
        </h3>
      </div>

      {/* Current Campaign Card */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-foreground">Current Campaign</span>
        </div>
        <p className="text-sm font-medium text-foreground">SaaS CFOs Q4</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            44% open
          </span>
          <span className="flex items-center gap-1">
            <Target size={12} />
            12% reply
          </span>
        </div>
      </div>

      {/* Aurelius Knows */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Aurelius knows
        </h4>
        <ul className="space-y-2">
          {[
            { icon: Sparkles, text: "Brand voice: Direct & Consultative" },
            { icon: Users, text: "Target: SaaS CFOs at Series A+" },
            { icon: Target, text: "Pain point: Scaling outbound" },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-2 text-xs text-muted-foreground">
              <item.icon size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Topics */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recent topics
        </h4>
        <div className="space-y-1">
          {[
            "Review Q4 campaign performance",
            "Suggest prospects for retargeting",
            "Write follow-up sequence",
          ].map((topic) => (
            <button
              key={topic}
              className="w-full text-left text-xs text-muted-foreground hover:text-amber-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-amber-50/50"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN CHAT PAGE
   ════════════════════════════════════════════════════════════ */

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 5 * 24)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate Aurelius response
    setTimeout(() => {
  const aureliusResponses = [
    "Great question! Let me analyze your campaigns. Based on the data, I recommend focusing on your SaaS Q4 campaign — it has strong open rates but could use a revised CTA to boost replies.",
    "I've reviewed your prospect list and found 5 new potential leads that match your target profile. Would you like me to draft introductory emails for them?",
    "Looking at your reply rates, email 2 in your sequence is outperforming email 1 by 23%. I suggest swapping the subject lines to test if that improves open rates.",
    "I can write a follow-up sequence for your 'Agency Retainers' campaign. The tone should be consultative — focusing on the value they've seen so far and offering a case study.",
  ];
  const reply = aureliusResponses[Math.floor(Math.random() * aureliusResponses.length)] ?? "Let me look into that for you.";

  const aureliusMsg: ChatMessage = {
    id: `au-${Date.now()}`,
    role: "aurelius",
    content: reply,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, aureliusMsg]);
  setIsTyping(false);
}, 1500);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chat Thread Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                <MessageBubble message={msg} />
              </div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border/50 bg-card px-6 py-4">
          {/* Suggested Prompts */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={prompt.text}
                  onClick={() => {
                    setInput(prompt.text);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-muted-foreground border border-border/50 hover:border-amber-300 hover:text-foreground transition-colors whitespace-nowrap shrink-0"
                >
                  <Icon size={12} />
                  {prompt.text}
                </button>
              );
            })}
          </div>

          {/* Input + Send */}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aurelius anything…"
                rows={1}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 pr-12 text-sm text-foreground outline-none focus:border-amber-400/50 transition-all resize-none placeholder:text-muted-foreground/60"
                style={{ maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <ContextPanel />
    </div>
  );
}
}