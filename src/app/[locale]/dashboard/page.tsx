"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, PenLine, ArrowUpRight, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { authClient } from "@/lib/auth/auth-client";
import { Plan } from "@/lib/auth/gatekeeper";
import { User } from "@/db/schema";

// Dynamic imports for Recharts components
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });

const PROJECTS = [
  { id: "chen-arcadia", name: "J. Chen", company: "Arcadia Finance", date: "May 6", status: "ACTIVE", confidence: 93 },
  { id: "miller-saas", name: "S. Miller", company: "NorthStack", date: "May 4", status: "DRAFT", confidence: 71 },
  { id: "patel-fund", name: "R. Patel", company: "Helix Capital", date: "Apr 30", status: "COMPLETE", confidence: 88 },
  { id: "okafor-bio", name: "T. Okafor", company: "BioForge", date: "Apr 28", status: "ACTIVE", confidence: 84 },
  { id: "lindberg-vc", name: "K. Lindberg", company: "Tundra VC", date: "Apr 26", status: "COMPLETE", confidence: 91 },
  { id: "ortega-retail", name: "M. Ortega", company: "Solera Retail", date: "Apr 24", status: "DRAFT", confidence: 62 },
];

const CHART = [
  { d: "Sat", v: 3 }, { d: "Sun", v: 1 }, { d: "Mon", v: 6 }, { d: "Tue", v: 11 }, { d: "Wed", v: 7 }, { d: "Thu", v: 9 }, { d: "Fri", v: 8 },
];

const statsData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 25 },
  { day: 'Fri', count: 32 },
  { day: 'Sat', count: 28 },
  { day: 'Sun', count: 35 },
];

function StatusDot({ s }: { s: string }) {
  const c = s === "ACTIVE" ? "var(--copper)" : s === "COMPLETE" ? "var(--consensus)" : "rgba(248,247,244,0.3)";
  return (
    <span className="text-[10px] tracking-widest text-cream/40 flex items-center gap-1.5 uppercase">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c, boxShadow: s === "ACTIVE" ? `0 0 8px ${c}` : "none" }} />
      {s}
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [newOpen, setNewOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <NewProjectDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(data: { name: string; company: string; goal: string; tone: string }) => console.log("create", data)}
        userPlan={userPlan}
      />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Hero */}
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-end">
          <motion.div variants={item}>
            <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-3 font-mono">Friday · May 8 · 09:42</div>
            <h1 className="font-display text-[44px] leading-[1.05]">
              Good morning, Bogdan.<br />
              <span className="text-cream/50 italic">Four agents are awake.</span>
            </h1>
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setNewOpen(true)}
            className="group relative overflow-hidden self-end px-6 py-4 border border-copper text-copper rounded-md text-[13px] tracking-wider uppercase flex items-center justify-between gap-3 hover:bg-copper/10 transition-colors"
          >
            <span className="flex items-center gap-2"><Plus size={15} /> New Project</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        </div>

        <motion.div variants={item} className="copper-streak mt-10" />

        {/* Metrics */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-copper/10 mt-10 rounded-md overflow-hidden">
          {[
            { label: "Active", value: "4", sub: "projects" },
            { label: "Drafted", value: "27", sub: "emails this month", icon: <PenLine size={14} className="text-copper" /> },
            { label: "Confidence", value: "91%", sub: "agent average" },
            { label: "Output", value: "12", sub: "this week", color: "var(--consensus)" },
          ].map((m) => (
            <div key={m.label} className="bg-obsidian p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.2em] text-cream/40 uppercase">{m.label}</span>
                {m.icon}
              </div>
              <div className="font-display text-[40px] leading-none mt-3" style={{ color: m.color ?? "var(--cream)" }}>
                {m.value}
              </div>
              <div className="text-[11px] text-cream/40 mt-2">{m.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Projects */}
        <motion.div variants={item} className="mt-14 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-copper uppercase mb-1 font-mono">{/* 06 Projects */}</div>
            <h2 className="font-display text-[28px]">Your roster</h2>
          </div>
          <Link href="/dashboard" className="text-[12px] text-cream/50 hover:text-copper">View all →</Link>
        </motion.div>

        <motion.div variants={item} className="mt-6 border-t border-copper/15">
          {PROJECTS.map((p) => (
            <Link
              key={p.id} href={`/dashboard/war-room/${p.id}`}
              className="group grid grid-cols-[1fr_1fr_140px_120px_24px] gap-6 items-center px-2 py-5 border-b border-copper/10 hover:bg-copper/5 transition-colors"
            >
              <div>
                <div className="font-display text-[17px] group-hover:text-copper transition-colors">{p.name}</div>
                <div className="text-[12px] text-cream/40">{p.company}</div>
              </div>
              <div className="text-[12px] text-cream/50 font-mono">{p.date}</div>
              <StatusDot s={p.status} />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[2px] bg-copper/15 relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-copper" style={{ width: `${p.confidence}%` }} />
                </div>
                <span className="text-[10px] text-cream/40 font-mono w-8">{p.confidence}%</span>
              </div>
              <ArrowUpRight size={14} className="text-cream/30 group-hover:text-copper group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          ))}
        </motion.div>

        {/* Output chart */}
        <motion.div variants={item} className="mt-16 grid md:grid-cols-[1fr_240px] gap-8 items-stretch">
          <div className="glass-deep p-6 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-[0.25em] text-copper uppercase mb-1 font-mono">{/* Output */}</div>
                <h3 className="font-display text-[20px]">Last 7 days</h3>
              </div>
              <Activity size={16} className="text-cream/40" />
            </div>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(193,123,63,0.4)" />
                      <stop offset="100%" stopColor="rgba(193,123,63,0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" stroke="rgba(248,247,244,0.35)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(248,247,244,0.35)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--obsidian-light)", border: "1px solid var(--copper)", borderRadius: 8 }} labelStyle={{ color: "var(--cream)" }} />
                  <Area type="monotone" dataKey="v" stroke="var(--copper)" strokeWidth={2} fill="url(#g)" dot={{ fill: "var(--copper)", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-deep p-6 flex flex-col justify-between">
            <div>
              <div className="text-[10px] tracking-[0.25em] text-copper uppercase mb-1 font-mono">{/* Insight */}</div>
              <p className="font-display text-[18px] leading-snug mt-2">&quot;Tuesday mornings convert 2.3&times; better than Friday afternoons.&quot;</p>
            </div>
            <div className="text-[11px] text-cream/40 mt-4">&mdash; Strategist agent</div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.section variants={item} className="glass-deep p-10 rounded-3xl border border-white/5 mt-12 min-w-0">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-copper/10 rounded-2xl text-copper">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Aggregate Swarm Performance</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--burgundy)" />
                    <stop offset="100%" stopColor="var(--copper)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(248, 247, 244, 0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(248, 247, 244, 0.2)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--obsidian)', border: '1px solid rgba(193, 123, 63, 0.2)', borderRadius: '16px' }}
                  itemStyle={{ color: 'var(--copper)', fontWeight: 800 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={4} 
                  dot={{ fill: 'var(--copper)', strokeWidth: 2, r: 4, stroke: 'var(--obsidian)' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
