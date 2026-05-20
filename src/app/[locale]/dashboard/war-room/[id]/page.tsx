"use client";

import React, { useEffect, useState } from "react";
import { SwarmCanvas } from "@/components/swarm/SwarmCanvas";
import { useParams } from "next/navigation";
import { subscribeToSwarm } from "@/lib/supabase/realtime";
import { useSwarmStore } from "@/stores/swarmStore";
import { usePostHog } from "posthog-js/react";
import { ConfidenceScore } from "@/components/swarm/ConfidenceScore";
import { ReactionPanel } from "@/components/twin/ReactionPanel";
import { EmailEditor } from "@/components/editor/EmailEditor";
import { TwinProfile } from "@/components/twin/TwinProfile";
import { SwarmFeed } from "@/components/swarm/SwarmFeed";
import { ConsensusOverlay } from "@/components/swarm/ConsensusOverlay";
import { AureliusChat } from "@/components/aurelius/AureliusChat";
import { buildContext, type AureliusContext } from "@/lib/aurelius/context";
import {
  Database, FileText, Layout, Activity, Crown,
  MessageSquare, Wrench, Settings2, Gauge,
  CheckCircle2,
  Eye, EyeOff, Save, Copy,
  Brain,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import { User } from "@/db/schema";
import Link from "next/link";
import { UploadZone } from "@/components/vault/UploadZone";
import { motion } from "framer-motion";
import { SpecialTools } from "@/components/tools/SpecialTools";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const API_KEY_STORAGE = "mailmind-custom-api-key";
const API_PROVIDER_STORAGE = "mailmind-api-provider";
const API_MODEL_STORAGE = "mailmind-api-model";

type RightTab = "twin" | "chat" | "tools" | "api";
type ApiProvider = "openai" | "openrouter";

// ─── UPGRADE GATE ─────────────────────────────────────────────────────────────

function UpgradeGate({ plan }: { plan: string }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#fdfbf7]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center max-w-md px-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff5f5f] to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#ff5f5f]/20">
          <Crown size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
          War Room Access
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          The War Room is an exclusive command center reserved for{" "}
          <span className="font-bold text-gray-700">PROFESSIONAL</span> plan
          subscribers.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Crown size={14} /> Your Plan: {plan}
          </p>
          <ul className="space-y-1.5 text-xs text-amber-700">
            <li className="flex items-center gap-2">✗ War Room access</li>
            <li className="flex items-center gap-2">✗ Advanced Digital Twin</li>
            <li className="flex items-center gap-2">✗ Custom API configuration</li>
            <li className="flex items-center gap-2">✗ Special tools & analytics</li>
          </ul>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#ff5f5f] to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Crown size={18} /> Upgrade to PROFESSIONAL
        </Link>
        <p className="text-[10px] text-gray-400 mt-4">
          Unlock all agents, tools, API customization, and priority support.
        </p>
      </motion.div>
    </div>
  );
}

// ─── API USAGE GAUGE ──────────────────────────────────────────────────────────

function ApiUsageGauge() {
  const [usage, setUsage] = useState<{ percent: number; isExceeded: boolean } | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage({ percent: data.usagePercent || 0, isExceeded: data.isExceeded || false });
        }
      } catch { /* silent */ }
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!usage) return null;

  const color =
    usage.isExceeded || usage.percent >= 100
      ? "bg-red-500"
      : usage.percent >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <Gauge size={14} className={usage.percent >= 80 ? "text-amber-500" : "text-emerald-500"} />
      <div className="flex-1 w-20">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usage.percent, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold ${usage.percent >= 80 ? "text-amber-600" : "text-gray-500"}`}>
        {usage.percent}%
      </span>
    </div>
  );
}

// ─── API SETTINGS PANEL ───────────────────────────────────────────────────────

function ApiSettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<ApiProvider>("openrouter");
  const [model, setModel] = useState("gpt-4o");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem(API_KEY_STORAGE) || "");
    setProvider((localStorage.getItem(API_PROVIDER_STORAGE) as ApiProvider) || "openrouter");
    setModel(localStorage.getItem(API_MODEL_STORAGE) || "gpt-4o");
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
    localStorage.setItem(API_PROVIDER_STORAGE, provider);
    localStorage.setItem(API_MODEL_STORAGE, model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey("");
    setSaved(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Settings2 size={14} className="text-gray-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          API Configuration
        </span>
      </div>

      {/* Provider Select */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold mb-1.5 block">Provider</label>
        <div className="flex gap-2">
          {(["openrouter", "openai"] as ApiProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
                provider === p
                  ? "bg-[#ff5f5f]/10 border-[#ff5f5f] text-[#ff5f5f]"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p === "openrouter" ? "OpenRouter" : "OpenAI"}
            </button>
          ))}
        </div>
      </div>

      {/* Model Select */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold mb-1.5 block">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-xs outline-none focus:border-[#ff5f5f] transition-all"
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold mb-1.5 block">API Key {apiKey ? "(overriding default)" : "(using default)"}</label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-16 rounded-lg bg-white border border-gray-200 text-gray-800 text-xs outline-none focus:border-[#ff5f5f] transition-all placeholder:text-gray-300"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showKey ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
            </button>
            {apiKey && (
              <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#ff5f5f] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 transition-all"
        >
          {saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
        {apiKey && (
          <button
            onClick={handleClear}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-all"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── RIGHT PANEL TABS ─────────────────────────────────────────────────────────

const TABS: { id: RightTab; label: string; icon: React.ElementType }[] = [
  { id: "twin", label: "Twin", icon: Brain },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "api", label: "API", icon: Settings2 },
];

function RightPanel({
  activeTab,
  setActiveTab,
  confidenceScore,
  campaignId,
}: {
  activeTab: RightTab;
  setActiveTab: (tab: RightTab) => void;
  confidenceScore: number;
  campaignId: string;
}) {
  const swarm = useSwarmStore();
  const aureliusContext: AureliusContext = buildContext({
    swarm: {
      status: swarm.status === "swarm_running" ? "running" :
              swarm.status === "awaiting_approval" ? "awaiting_approval" :
              swarm.status === "consensus_reached" ? "success" :
              swarm.status === "conflict" ? "error" : "idle",
      confidenceScore: swarm.confidenceScore,
      activeAgent: swarm.activeAgent ?? undefined,
    },
    twin: { profile: undefined },
    pathname: `/dashboard/war-room/${campaignId}`,
  });

  return (
    <section className="w-80 flex flex-col overflow-hidden min-w-0">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#ff5f5f] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {activeTab === "twin" && (
            <div className="space-y-4 pr-1">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Prospect Analysis</h3>
                <TwinProfile profile={null} />
                <ReactionPanel data={null} isConsensus={confidenceScore >= 100} />
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    Awaiting Psychologist synthesis to populate persona traits and reaction maps...
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <AureliusChat context={aureliusContext} />
            </div>
          )}

          {activeTab === "tools" && (
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
              <SpecialTools />
            </div>
          )}

          {activeTab === "api" && (
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
              <ApiSettingsPanel />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function WarRoomPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { traceLogs, confidenceScore, addAgentMessage } = useSwarmStore();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState<RightTab>("twin");

  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";

  useEffect(() => {
    if (!campaignId) return;

    posthog.capture("war_room_viewed", { campaign_id: campaignId });

    const unsubscribe = subscribeToSwarm(campaignId, (payload) => {
      addAgentMessage(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [campaignId, addAgentMessage, posthog]);

  // 🚪 Gate: only PROFESSIONAL can access
  if (userPlan !== "PROFESSIONAL") {
    return <UpgradeGate plan={userPlan} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative bg-[#fdfbf7]">
      <ConsensusOverlay show={confidenceScore >= 100} />

      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#ff5f5f] animate-pulse" />
          <h1 className="text-sm font-black tracking-widest uppercase text-gray-900">
            War Room{" "}
            <span className="text-[#ff5f5f]/60 ml-2">
              #{campaignId?.slice(0, 8)}
            </span>
          </h1>
          <div className="ml-4 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ff5f5f]/10 to-purple-500/10 border border-[#ff5f5f]/20">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#ff5f5f] flex items-center gap-1">
              <Crown size={10} /> PROFESSIONAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ApiUsageGauge />
          <ConfidenceScore value={confidenceScore} />
          <button className="px-6 py-2 bg-[#ff5f5f] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(255,95,95,0.2)]">
            Launch Campaign
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel: Assets & Feed */}
        <section className="w-64 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-white rounded-3xl p-6 border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6 flex items-center gap-2">
              <Database size={12} /> Asset Manager
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <UploadZone
                userPlan={userPlan}
                projectId={campaignId}
                onUploadComplete={(url) => console.log("Uploaded:", url)}
              />
              <div className="space-y-4 mt-6">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#ff5f5f]/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#ff5f5f]" />
                    <span className="text-xs font-bold truncate text-gray-800">
                      Brand_Guide_V2.pdf
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#ff5f5f]/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Layout size={16} className="text-[#ff5f5f]" />
                    <span className="text-xs font-bold truncate text-gray-800">
                      Case_Study_AI.docx
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white rounded-3xl p-6 border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
              <Activity size={12} /> Swarm Feed
            </h3>
            <SwarmFeed logs={traceLogs} />
          </div>
        </section>

        {/* Center: Swarm Canvas & Editor */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                Swarm Orchestration
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[8px] text-gray-500 font-bold uppercase">
                  Live Broadcast
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <SwarmCanvas />
            </div>
          </div>

          <div className="h-1/3">
            <EmailEditor content={null} />
          </div>
        </section>

        {/* Right Panel: Tabbed (Twin | Chat | Tools | API) */}
        <RightPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          confidenceScore={confidenceScore}
          campaignId={campaignId}
        />
      </main>
    </div>
  );
}
