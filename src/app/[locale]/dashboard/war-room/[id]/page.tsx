"use client";

import React, { useEffect } from "react";
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
import { Database, FileText, Layout, Activity, Lock } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import { User } from "@/db/schema";
import Link from "next/link";
import { UploadZone } from "@/components/vault/UploadZone";

export default function WarRoomPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { traceLogs, confidenceScore, addAgentMessage } = useSwarmStore();
  const posthog = usePostHog();

  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";
  const limits = PLAN_LIMITS[userPlan];

  useEffect(() => {
    if (!campaignId) return;

    posthog.capture('war_room_viewed', { campaign_id: campaignId });

    const unsubscribe = subscribeToSwarm(campaignId, (payload) => {
      addAgentMessage(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [campaignId, addAgentMessage, posthog]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] text-cream overflow-hidden relative">
      <ConsensusOverlay show={confidenceScore >= 100} />
      
      {/* Header (War Room Specific) */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-obsidian/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          <h1 className="text-sm font-black tracking-widest uppercase">
            War Room <span className="text-copper/60 ml-2">#{campaignId?.slice(0, 8)}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ConfidenceScore value={confidenceScore} />
          {userPlan === "FREE" ? (
            <Link 
              href="/pricing"
              className="px-6 py-2 bg-white/5 border border-copper/30 text-copper text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-copper/10 transition-all flex items-center gap-2"
            >
              <Lock size={12} /> Upgrade to Launch
            </Link>
          ) : (
            <button className="px-6 py-2 bg-copper text-obsidian text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-copper-light transition-all shadow-[0_0_20px_rgba(193,123,63,0.2)]">
              Launch Campaign
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel: Assets & Feed */}
        <section className="w-64 flex flex-col gap-6 overflow-hidden">
          <div className={`flex-1 glass-card rounded-3xl p-6 border border-white/5 overflow-hidden flex flex-col ${!limits.hasVault ? 'opacity-50' : ''}`}>
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6 flex items-center gap-2">
              <Database size={12} /> Asset Manager { !limits.hasVault && <Lock size={10} className="text-copper" /> }
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <UploadZone 
                userPlan={userPlan} 
                projectId={campaignId} 
                onUploadComplete={(url) => console.log("Uploaded:", url)} 
              />
              
              {limits.hasVault && (
                <div className="space-y-4 mt-6">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-copper/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-copper" />
                      <span className="text-xs font-bold truncate">Brand_Guide_V2.pdf</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-copper/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Layout size={16} className="text-copper" />
                      <span className="text-xs font-bold truncate">Case_Study_AI.docx</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-64 glass-card rounded-3xl p-6 border border-white/5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 flex items-center gap-2">
              <Activity size={12} /> Swarm Feed
            </h3>
            <SwarmFeed logs={traceLogs} />
          </div>
        </section>

        {/* Center: Swarm Canvas & Editor */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Swarm Orchestration</h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] text-white/60 font-bold uppercase">Live Broadcast</span>
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

        {/* Right Panel: Insights & Trace */}
        <section className="w-80 flex flex-col gap-6 overflow-hidden min-w-0">
          {/* Digital Twin Insights */}
          <div className={`h-full glass-card rounded-3xl p-6 border border-copper/10 overflow-hidden flex flex-col relative min-w-0 ${!limits.hasDigitalTwin ? 'opacity-50 grayscale' : ''}`}>
            <div className="absolute top-0 right-0 p-4">
              <div className="px-2 py-1 rounded bg-copper/10 border border-copper/20 text-[8px] text-copper font-bold uppercase flex items-center gap-1">
                {!limits.hasDigitalTwin && <Lock size={8} />} Digital Twin
              </div>
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Prospect Analysis</h3>
            
            {limits.hasDigitalTwin ? (
              <>
                <TwinProfile profile={null} />
                <ReactionPanel data={null} isConsensus={confidenceScore >= 100} />
                
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-white/40 leading-relaxed italic">
                    Awaiting Psychologist synthesis to populate persona traits and reaction maps...
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Lock size={32} className="text-copper/40 mb-4" />
                <p className="text-xs font-bold text-copper uppercase tracking-widest mb-2">Premium Feature</p>
                <p className="text-[10px] text-white/40 mb-6">
                  Digital Twin profiling & Reaction Simulation are available on the PROFESSIONAL plan.
                </p>
                <Link 
                  href="/pricing"
                  className="px-6 py-2 bg-copper/10 border border-copper/20 text-copper text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-copper/20 transition-all"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
