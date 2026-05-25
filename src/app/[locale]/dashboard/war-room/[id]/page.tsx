"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SwarmCanvas } from "@/components/swarm/SwarmCanvas";
import { useParams } from "next/navigation";
import { subscribeToSwarm } from "@/lib/supabase/realtime";
import { useSwarmStore } from "@/stores/swarmStore";
import { usePostHog } from "posthog-js/react";
import { ConfidenceScore } from "@/components/swarm/ConfidenceScore";
import { ReactionPanel } from "@/components/twin/ReactionPanel";
import { EmailEditor } from "@/components/editor/EmailEditor";
import type { VersionEntry } from "@/types/editor";
import { TwinProfile } from "@/components/twin/TwinProfile";
import { SwarmFeed } from "@/components/swarm/SwarmFeed";
import { ConsensusOverlay } from "@/components/swarm/ConsensusOverlay";
import { AureliusChat } from "@/components/aurelius/AureliusChat";
import { ResumeBanner } from "@/components/swarm/ResumeBanner";
import { WarRoomMetrics } from "@/components/swarm/WarRoomMetrics";
import { ApprovalMatrix, type ApprovalParam } from "@/components/swarm/ApprovalMatrix";
import { SplitDiffView } from "@/components/editor/SplitDiffView";
import { buildContext, type AureliusContext } from "@/lib/aurelius/context";
import {
  Database, FileText, Layout, Activity, Crown,
  MessageSquare, Wrench, Gauge,
  Brain, GitCompare,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import { User } from "@/db/schema";
import Link from "next/link";
import { UploadZone } from "@/components/vault/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialTools } from "@/components/tools/SpecialTools";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

type RightTab = "twin" | "chat" | "tools" | "approval";

// ─── UPGRADE GATE ─────────────────────────────────────────────────────────────

function UpgradeGate({ plan }: { plan: string }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center max-w-md px-8"
      >
        <div className="w-20 h-20 rounded-xl bg-copper flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Crown size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground mb-3">
          War Room Access
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          The War Room is an exclusive command center reserved for{" "}
          <span className="font-bold text-foreground/80">PROFESSIONAL</span> plan
          subscribers.
        </p>
        <div className="bg-muted border border-border rounded-xl p-4 mb-8 text-left">
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
            <Crown size={14} /> Your Plan: {plan}
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">— War Room access</li>
            <li className="flex items-center gap-2">— Advanced Digital Twin</li>
            <li className="flex items-center gap-2">— Special tools & analytics</li>
          </ul>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-copper text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
        >
          <Crown size={18} /> Upgrade to PROFESSIONAL
        </Link>
        <p className="text-[10px] text-muted-foreground mt-4">
          Unlock all agents, tools, and priority support.
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
    <div className="flex items-center gap-3 px-3 py-1.5 bg-card rounded-xl border border-border shadow-sm">
      <Gauge size={14} className={usage.percent >= 80 ? "text-amber-500" : "text-emerald-500"} />
      <div className="flex-1 w-20">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usage.percent, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold ${usage.percent >= 80 ? "text-amber-600" : "text-muted-foreground"}`}>
        {usage.percent}%
      </span>
    </div>
  );
}

// ─── RIGHT PANEL TABS ─────────────────────────────────────────────────────────

const TABS: { id: RightTab; label: string; icon: React.ElementType }[] = [
  { id: "twin", label: "Twin", icon: Brain },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "approval", label: "Gate", icon: Activity },
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

  // Build mock approval params from swarm data for demo / real state
  const approvalParams: ApprovalParam[] = [
    {
      label: "Tone Compliance",
      key: "tone",
      score: Math.min(confidenceScore + 10, 100),
      threshold: 70,
      passed: confidenceScore >= 60,
      detail: "Email tone matches brand voice and prospect profile.",
    },
    {
      label: "Fact Accuracy",
      key: "facts",
      score: Math.min(confidenceScore + 5, 100),
      threshold: 60,
      passed: confidenceScore >= 55,
      detail: "Claims are backed by research data and sources.",
    },
    {
      label: "Length Guard",
      key: "length",
      score: 85,
      threshold: 60,
      passed: true,
      detail: "Email body is within optimal 120–180 word range.",
    },
    {
      label: "OCEAN Match",
      key: "ocean",
      score: Math.min(confidenceScore, 100),
      threshold: 65,
      passed: confidenceScore >= 65,
      detail: "Language style matches prospect's personality profile.",
    },
  ];

  const approvalPassed = confidenceScore >= 60;

  return (
    <section className="w-80 flex flex-col overflow-hidden min-w-0">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-card text-copper shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">
                  Prospect Analysis
                </h3>
                <TwinProfile profile={null} />
                <div className="mt-4 pt-4 border-t border-border">
                  <ReactionPanel data={null} isConsensus={confidenceScore >= 100} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <AureliusChat context={aureliusContext} />
            </div>
          )}

          {activeTab === "tools" && (
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <SpecialTools />
            </div>
          )}

          {activeTab === "approval" && (
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">
                Approval Gate
              </h3>
              <ApprovalMatrix
                params={approvalParams}
                overallPassed={approvalPassed}
                confidenceScore={confidenceScore}
                threshold={60}
                failedComponents={approvalPassed ? [] : ["Tone Compliance", "OCEAN Match"]}
                recommendations={approvalPassed ? [] : [
                  "Reduce aggressiveness in opening paragraph",
                  "Add more personalization based on OCEAN profile",
                ]}
              />
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
  const { traceLogs, confidenceScore, addAgentMessage, status, activeAgent } = useSwarmStore();
  const posthog = usePostHog();
  const [activeTab, setActiveTab] = useState<RightTab>("twin");
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [diffViewOpen, setDiffViewOpen] = useState(false);
  const [diffLeftVersion, setDiffLeftVersion] = useState<VersionEntry | null>(null);

  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";

  // Mock versions for demo — in production, fetched from API
  const [versions, setVersions] = useState<VersionEntry[]>([
    {
      id: "v1",
      shortHash: "a3f2b1c",
      author: "Copywriter",
      description: "Initial draft — cold outreach",
      content: "<p>Hi {{first_name}},</p><p>I noticed your team at {{company}} is scaling operations. We built MailMind to automate exactly that — here's a quick case study.</p><p>Would you be open to a 15-minute call this week?</p><p>Best,<br>{{sender_name}}</p>",
      timestamp: Date.now() - 3600000,
      branch: "ai",
    },
    {
      id: "v2",
      shortHash: "d7e4a8f",
      author: "Strategist",
      description: "Added value prop + social proof",
      content: "<p>Hi {{first_name}},</p><p>Congrats on the recent {{milestone}} — impressive growth! I noticed {{company}} is scaling operations and thought you'd find this relevant.</p><p>Teams like {{similar_company}} use MailMind to 3x their outreach response rates with AI-powered personalization. Here's how it works...</p><p>Open to exploring this further?</p><p>Best,<br>{{sender_name}}</p>",
      timestamp: Date.now() - 2400000,
      branch: "ai",
      parentHash: "a3f2b1c",
    },
    {
      id: "v3",
      shortHash: "f9c2b5e",
      author: "User Edit",
      description: "Softened tone, added personal touch",
      content: "<p>Hi {{first_name}},</p><p>Hope you're having a great week! I've been following {{company}}'s journey and the recent {{milestone}} is truly impressive.</p><p>We built MailMind to help teams like yours scale outreach without losing the human touch. Teams using it are seeing <strong>3x higher</strong> response rates through AI-powered personalization.</p><p>No rush — but if you're curious, I'd love to share how it works in a quick 15-minute call.</p><p>Warmly,<br>{{sender_name}}</p>",
      timestamp: Date.now() - 1200000,
      branch: "user",
      parentHash: "d7e4a8f",
    },
  ]);

  useEffect(() => {
    if (!campaignId) return;

    posthog.capture("war_room_viewed", { campaign_id: campaignId });

    const unsubscribe = subscribeToSwarm(campaignId, (payload) => {
      addAgentMessage(payload);
    });

    // Check for interrupted swarms
    const checkIncomplete = async () => {
      try {
        const res = await fetch(`/api/swarm/resume?campaignId=${campaignId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.resumable) {
            setShowResumeBanner(true);
          }
        }
      } catch { /* silent */ }
    };
    checkIncomplete();

    return () => {
      unsubscribe();
    };
  }, [campaignId, addAgentMessage, posthog]);

  // 🚪 Gate: only PROFESSIONAL can access
  if (userPlan !== "PROFESSIONAL") {
    return <UpgradeGate plan={userPlan} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative bg-background">
      <ConsensusOverlay show={confidenceScore >= 100} />

      {/* Resume banner */}
      <ResumeBanner
        show={showResumeBanner}
        activeAgent={activeAgent}
        campaignId={campaignId}
        onDismiss={() => setShowResumeBanner(false)}
      />

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          <h1 className="text-sm font-black tracking-widest uppercase text-foreground">
            War Room{" "}
            <span className="text-copper/60 ml-2">
              #{campaignId?.slice(0, 8)}
            </span>
          </h1>
          <div className="ml-4 px-2.5 py-1 rounded-full bg-copper/5 border border-copper/20">
            <span className="text-[8px] font-black uppercase tracking-widest text-copper flex items-center gap-1">
              <Crown size={10} /> PROFESSIONAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ApiUsageGauge />
          <ConfidenceScore value={confidenceScore} />
          <button className="px-6 py-2 bg-copper text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-copper/80 transition-all shadow-sm">
            Launch Campaign
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-6 p-6 overflow-hidden min-h-0">
        {/* Left Panel: Metrics + Assets + Feed */}
        <section className="w-64 flex flex-col gap-4 overflow-hidden shrink-0">
          {/* Live metrics */}
          <div className="shrink-0">
            <WarRoomMetrics />
          </div>

          {/* Asset Manager */}
          <div className="flex-1 bg-card rounded-xl p-5 border border-border overflow-hidden flex flex-col shadow-sm min-h-0">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 flex items-center gap-2 shrink-0">
              <Database size={12} /> Asset Manager
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <UploadZone
                userPlan={userPlan}
                projectId={campaignId}
                onUploadComplete={(url) => console.log("Uploaded:", url)}
              />
              <div className="space-y-3 mt-4">
                <div className="p-3 bg-muted rounded-lg border border-border hover:border-copper/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-copper" />
                    <span className="text-[11px] font-bold truncate text-foreground">
                      Brand_Guide_V2.pdf
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg border border-border hover:border-copper/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Layout size={14} className="text-copper" />
                    <span className="text-[11px] font-bold truncate text-foreground">
                      Case_Study_AI.docx
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swarm Feed */}
          <div className="h-56 bg-card rounded-xl p-5 border border-border overflow-hidden flex flex-col shadow-sm shrink-0">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-2 shrink-0">
              <Activity size={12} /> Swarm Feed
            </h3>
            <div className="flex-1 overflow-hidden">
              <SwarmFeed logs={traceLogs} />
            </div>
          </div>
        </section>

        {/* Center: Swarm Canvas & Editor */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Swarm Orchestration
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-muted border border-border text-[8px] text-muted-foreground font-bold uppercase">
                  Live Broadcast
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <SwarmCanvas />
            </div>
          </div>

          <div className="h-1/3 shrink-0">
            <EmailEditor
              content={null}
              versions={versions}
              onVersionSelect={(version) => setDiffLeftVersion(version)}
              onVersionRestore={(version) => {
                // Version content restoration handled by EmailEditor internally
                // The editor's previewVersion state handles displaying restored content
              }}
            />
          </div>
        </section>

        {/* Right Panel: Tabbed (Twin | Chat | Tools | Gate) */}
        <RightPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          confidenceScore={confidenceScore}
          campaignId={campaignId}
        />
      </main>

      {/* Split Diff View Overlay */}
      <AnimatePresence>
        {diffViewOpen && diffLeftVersion && (
          <SplitDiffView
            leftVersion={diffLeftVersion}
            rightVersion={versions[versions.length - 1]?.content || "<p>No draft yet</p>"}
            onRollback={(version) => {
              // Restore the selected version as current
              setVersions((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  shortHash: crypto.randomUUID().slice(0, 7),
                  author: "User Edit",
                  description: `Rollback to ${version.shortHash}`,
                  content: version.content,
                  timestamp: Date.now(),
                  branch: "user",
                  parentHash: versions[versions.length - 1]?.shortHash,
                },
              ]);
              setDiffViewOpen(false);
            }}
            onClose={() => setDiffViewOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Diff Compare button (floating) */}
      {diffLeftVersion && !diffViewOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setDiffViewOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all hover:border-copper/30"
        >
          <GitCompare size={14} className="text-copper" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Compare {diffLeftVersion.shortHash} → Current
          </span>
        </motion.button>
      )}
    </div>
  );
}
