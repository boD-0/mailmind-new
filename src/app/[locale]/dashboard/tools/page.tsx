"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, ArrowLeft, FlaskConical, Layers, Send, Download, Sparkles,
  Pencil, Search, Brain, BarChart3, ShieldCheck, Clock, Play,
  CheckCircle2, XCircle, RotateCcw, RefreshCw, Wrench, ChevronDown,
  Info,
} from "lucide-react";
import { SpecialTools } from "@/components/tools/SpecialTools";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/auth-client";
import { User } from "@/db/schema";
import { Plan } from "@/lib/auth/plans";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

type AgentStatus = "thinking" | "writing" | "done" | "waiting";
type SwarmStatus = "draft" | "running" | "paused" | "complete";
type TabView = "canvas" | "tools";

interface SwarmAgent {
  id: string;
  role: string;
  icon: React.ElementType;
  status: AgentStatus;
  confidence: number; // 0-100
  description: string;
}

interface SwarmState {
  name: string;
  status: SwarmStatus;
  progress: number; // 0-100
  elapsedTime: string;
  timeRemaining: string;
  overallConfidence: number;
  agents: SwarmAgent[];
  wasInterrupted: boolean;
  interruptedAgo: string;
}

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */

const STATUS_CHIP: Record<AgentStatus, { label: string; className: string }> = {
  thinking: { label: "Thinking", className: "bg-amber-100 text-amber-700" },
  writing: { label: "Writing", className: "bg-blue-100 text-blue-700" },
  done: { label: "Done", className: "bg-emerald-100 text-emerald-700" },
  waiting: { label: "Waiting", className: "bg-gray-100 text-gray-500" },
};

const SWARM_STATUS_CHIP: Record<SwarmStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700" },
  running: { label: "Running", className: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Paused", className: "bg-gray-100 text-gray-500" },
  complete: { label: "Complete", className: "bg-blue-100 text-blue-700" },
};

const INITIAL_SWARM: SwarmState = {
  name: "SaaS CFOs Q4 — Cold Outreach",
  status: "running",
  progress: 62,
  elapsedTime: "4m 12s",
  timeRemaining: "~2 min remaining",
  overallConfidence: 87,
  wasInterrupted: true,
  interruptedAgo: "2 hours ago",
  agents: [
    {
      id: "researcher",
      role: "Researcher",
      icon: Search,
      status: "done",
      confidence: 92,
      description: "Prospect research & enrichment",
    },
    {
      id: "strategist",
      role: "Strategist",
      icon: Brain,
      status: "done",
      confidence: 85,
      description: "Campaign strategy & sequencing",
    },
    {
      id: "copywriter",
      role: "Copywriter",
      icon: Pencil,
      status: "writing",
      confidence: 78,
      description: "Email copy & personalization",
    },
    {
      id: "analyst",
      role: "Analyst",
      icon: BarChart3,
      status: "waiting",
      confidence: 0,
      description: "Performance analysis & scoring",
    },
  ],
};

/* ════════════════════════════════════════════════════════════
   SWARM HEADER
   ════════════════════════════════════════════════════════════ */

function SwarmHeader({ swarm, onRename }: { swarm: SwarmState; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(swarm.name);
  const statusChip = SWARM_STATUS_CHIP[swarm.status];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { onRename(name); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { onRename(name); setEditing(false); } }}
            className="text-lg font-bold text-foreground bg-transparent border-b-2 border-copper outline-none px-1 py-0.5 min-w-[200px]"
          />
        ) : (
          <h2
            className="text-lg font-bold text-foreground truncate cursor-pointer hover:text-copper transition-colors"
            onClick={() => setEditing(true)}
            title="Click to rename"
          >
            {swarm.name}
          </h2>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusChip.className}`}>
          {statusChip.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
        <Clock size={12} />
        <span>{swarm.elapsedTime}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SWARM STATS ROW
   ════════════════════════════════════════════════════════════ */

function SwarmStats({ swarm }: { swarm: SwarmState }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Progress</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${swarm.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-copper"
            />
          </div>
          <span className="text-sm font-bold text-foreground font-mono">{swarm.progress}%</span>
        </div>
      </div>

      {/* Time remaining */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Estimated time</p>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{swarm.timeRemaining}</span>
        </div>
      </div>

      {/* Confidence score */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Confidence score
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1.5 text-[8px] text-muted-foreground/50 cursor-help inline-flex">
                  <Info size={12} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average confidence across all active agents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-sm font-bold text-foreground font-mono">{swarm.overallConfidence}%</span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full font-medium">Strong</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   RESUME BANNER
   ════════════════════════════════════════════════════════════ */

function ResumeBanner({ swarm }: { swarm: SwarmState }) {
  if (!swarm.wasInterrupted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-copper/30"
    >
      <div className="flex items-center gap-3">
        <RotateCcw size={16} className="text-copper" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Your swarm was interrupted {swarm.interruptedAgo}. Resume where you left off?
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-copper text-white text-xs font-bold hover:bg-copper/80 transition-all">
          <Play size={12} /> Resume
        </button>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Discard
        </button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   AGENT CARD
   ════════════════════════════════════════════════════════════ */

function AgentCard({ agent, index, total }: { agent: SwarmAgent; index: number; total: number }) {
  const Icon = agent.icon;
  const chip = STATUS_CHIP[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative bg-card rounded-xl border border-border p-5 w-full max-w-[220px]"
    >
      {/* Connector line (except last) */}
      {index < total - 1 && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 hidden lg:block">
          <div className="border-t border-dashed border-gray-300 dark:border-gray-700 relative">
            <ChevronDown size={10} className="absolute -right-1.5 -top-1.5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>
      )}

      {/* Icon + Role */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <Icon size={18} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{agent.role}</p>
          <p className="text-[10px] text-muted-foreground truncate">{agent.description}</p>
        </div>
      </div>

      {/* Status chip */}
      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${chip.className}`}>
        {agent.status === "thinking" && <RefreshCw size={10} className="mr-1 animate-spin" />}
        {agent.status === "writing" && <Pencil size={10} className="mr-1 animate-pulse" />}
        {agent.status === "done" && <CheckCircle2 size={10} className="mr-1" />}
        {agent.status === "waiting" && <Clock size={10} className="mr-1" />}
        {chip.label}
      </span>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</span>
          {agent.status !== "waiting" && (
            <span className="text-[10px] font-bold font-mono text-foreground">{agent.confidence}%</span>
          )}
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          {agent.status !== "waiting" ? (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agent.confidence}%` }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
              className="h-full rounded-full bg-copper"
            />
          ) : (
            <div className="h-full rounded-full bg-gray-200 dark:bg-gray-800" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   APPROVAL / OUTPUT AREA
   ════════════════════════════════════════════════════════════ */

function ApprovalArea() {
  const [draft, setDraft] = useState(
    "Hi {{first_name}},\n\nI noticed that {{company_name}} has been scaling their outbound team recently. At MailMind, we help agencies like yours automate multi-channel outreach without sacrificing personalization.\n\nWould you be open to a 15-minute call to see how we've helped similar teams increase reply rates by 40%?\n\nBest,\n{{sender_name}}"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-copper" />
        <h3 className="text-sm font-bold text-foreground">Swarm Output</h3>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium">Ready for review</span>
      </div>

      {/* Editable draft */}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={8}
        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-copper/50 transition-all resize-y font-sans leading-relaxed"
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-bold hover:bg-copper/80 transition-all">
            <CheckCircle2 size={14} /> Approve and send
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:text-foreground hover:border-copper/30 transition-all">
            <XCircle size={14} /> Request revision
          </button>
        </div>

        {/* Aurelius insight chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-copper/20 max-w-[260px]">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[8px] font-bold shrink-0">
            Au
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-tight">
            I think email 2 is the strongest. Want me to rewrite email 1 to match its tone?
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   SWARM CANVAS
   ════════════════════════════════════════════════════════════ */

function SwarmCanvas() {
  const [swarm, setSwarm] = useState<SwarmState>(INITIAL_SWARM);

  const handleRename = (name: string) => {
    setSwarm((prev) => ({ ...prev, name }));
  };

  return (
    <div className="space-y-2">
      {/* Swarm Header */}
      <SwarmHeader swarm={swarm} onRename={handleRename} />

      {/* Resume Banner */}
      <ResumeBanner swarm={swarm} />

      {/* Stats Row */}
      <SwarmStats swarm={swarm} />

      {/* Agent Nodes Canvas */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {swarm.agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} total={swarm.agents.length} />
          ))}
        </div>
      </div>

      {/* Approval Area */}
      <ApprovalArea />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   UPGRADE GATE
   ════════════════════════════════════════════════════════════ */

function UpgradeGate({ plan }: { plan: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center max-w-md px-8"
      >
        <div className="w-20 h-20 rounded-xl bg-copper flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Crown size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-3">
          Swarm Canvas & Tools
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          The Swarm Canvas and special tools (A/B Test, Sequence Builder, Send Test, Export) are exclusive to{" "}
          <span className="font-bold text-foreground/80">PROFESSIONAL</span> plan subscribers.
        </p>
        <div className="bg-muted border border-border rounded-xl p-4 mb-8 text-left">
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
            <Crown size={14} /> Your Plan: {plan}
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">— Visual Swarm Canvas with 4 agents</li>
            <li className="flex items-center gap-2">— A/B Subject Line Testing</li>
            <li className="flex items-center gap-2">— Sequence Builder</li>
            <li className="flex items-center gap-2">— Send Test Email & Export</li>
          </ul>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-copper text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
        >
          <Crown size={18} /> Upgrade to PROFESSIONAL
        </Link>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function ToolsPage() {
  const { locale } = useParams();
  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";
  const [view, setView] = useState<TabView>("canvas");

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  });

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-copper transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-3 font-mono flex items-center gap-2">
              <Sparkles size={12} /> Swarm Canvas
            </div>
            <h1 className="font-display text-[40px] leading-[1.05] text-foreground">
              {greeting}, Founder.<br />
              <span className="text-muted-foreground italic text-[20px]">Your agents are at work.</span>
            </h1>
          </div>

          {/* Tab switcher */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-muted rounded-xl border border-border">
            <button
              onClick={() => setView("canvas")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "canvas"
                  ? "bg-white dark:bg-gray-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play size={12} /> Canvas
            </button>
            <button
              onClick={() => setView("tools")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "tools"
                  ? "bg-white dark:bg-gray-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wrench size={12} /> Tools
            </button>
          </div>
        </div>
      </motion.div>

      {/* Gate or Content */}
      {userPlan !== "PROFESSIONAL" ? (
        <UpgradeGate plan={userPlan} />
      ) : (
        <AnimatePresence mode="wait">
          {view === "canvas" ? (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <SwarmCanvas />
            </motion.div>
          ) : (
            <motion.div
              key="tools"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick-jump row */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                  { label: "A/B Test", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
                  { label: "Sequence Builder", icon: Layers, color: "bg-blue-100 text-blue-600" },
                  { label: "Send Test", icon: Send, color: "bg-emerald-100 text-emerald-600" },
                  { label: "Export Campaign", icon: Download, color: "bg-amber-100 text-amber-600" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-border text-[9px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm"
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${t.color}`}>
                        <Icon size={10} />
                      </div>
                      {t.label}
                    </span>
                  );
                })}
              </div>

              {/* SpecialTools panel */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-border shadow-sm">
                <SpecialTools />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
