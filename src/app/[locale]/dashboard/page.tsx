"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, PenLine, ArrowUpRight, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { NewProjectDialog, type NewProjectData } from "@/components/dashboard/NewProjectDialog";
import { authClient } from "@/lib/auth/auth-client";
import { Plan } from "@/lib/auth/gatekeeper";
import { User } from "@/db/schema";
import { EventScheduler, type ScheduledEvent } from "@/components/ui/event-scheduler";

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
  const c = s === "ACTIVE" ? "#ff5f5f" : s === "COMPLETE" ? "#4CAF50" : "#c0bdb5";
  return (
    <span className="text-[10px] tracking-widest text-gray-400 flex items-center gap-1.5 uppercase">
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
  const [events, setEvents] = useState<ScheduledEvent[]>([
    {
      id: "1",
      title: "Chen – Arcadia proposal",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: "deadline",
    },
    {
      id: "2",
      title: "Team sync — Q2 campaigns",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: "meeting",
    },
    {
      id: "3",
      title: "Follow-up with R. Patel",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: "task",
    },
  ]);
  const { data: session } = authClient.useSession();
  const userPlan = (session?.user as User | undefined)?.plan as Plan || "FREE";

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">        <NewProjectDialog
          open={newOpen}
          onClose={() => setNewOpen(false)}
          onCreate={(data: NewProjectData) => {
            console.log("create", data);
            const dl = data.deadline;
            if (dl) {
              setEvents((prev) => [
                ...prev,
                {
                  id: `proj-${Date.now()}`,
                  title: `${data.name} – ${data.company}`,
                  date: dl,
                  type: "deadline" as const,
                },
              ]);
            }
          }}
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
            <div className="text-[11px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-3 font-mono">Friday · May 8 · 09:42</div>
            <h1 className="font-display text-[44px] leading-[1.05] text-gray-900">
              Good morning, Bogdan.<br />
              <span className="text-gray-400 italic">Four agents are awake.</span>
            </h1>
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setNewOpen(true)}
            className="group relative overflow-hidden self-end px-6 py-4 border border-[#ff5f5f] text-[#ff5f5f] rounded-md text-[13px] tracking-wider uppercase flex items-center justify-between gap-3 hover:bg-[#ff5f5f]/10 transition-colors"
          >
            <span className="flex items-center gap-2"><Plus size={15} /> New Project</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        </div>

        <div className="copper-streak mt-10" />

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#ff5f5f]/10 rounded-md overflow-hidden">
          {[
            { label: "Active", value: "4", sub: "projects" },
            { label: "Drafted", value: "27", sub: "emails this month", icon: <PenLine size={14} className="text-[#ff5f5f]" /> },
            { label: "Confidence", value: "91%", sub: "agent average" },
            { label: "Output", value: "12", sub: "this week", color: "#4CAF50" },
          ].map((m) => (
            <div key={m.label} className="bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">{m.label}</span>
                {m.icon}
              </div>
              <div className="font-display text-[40px] leading-none mt-3" style={{ color: m.color ?? "#1a1a1a" }}>
                {m.value}
              </div>
              <div className="text-[11px] text-gray-400 mt-2">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="mt-14 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{/* 06 Projects */}</div>
            <h2 className="font-display text-[28px] text-gray-900">Your roster</h2>
          </div>
          <Link href="/dashboard" className="text-[12px] text-gray-400 hover:text-[#ff5f5f]">View all →</Link>
        </div>

        <div className="mt-6 border-t border-gray-200">
          {PROJECTS.map((p) => (
            <Link
              key={p.id} href={`/dashboard/war-room/${p.id}`}
              className="group grid grid-cols-[1fr_1fr_140px_120px_24px] gap-6 items-center px-2 py-5 border-b border-gray-100 hover:bg-[#ff5f5f]/5 transition-colors"
            >
              <div>
                <div className="font-display text-[17px] text-gray-900 group-hover:text-[#ff5f5f] transition-colors">{p.name}</div>
                <div className="text-[12px] text-gray-400">{p.company}</div>
              </div>
              <div className="text-[12px] text-gray-400 font-mono">{p.date}</div>
              <StatusDot s={p.status} />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[2px] bg-gray-200 relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-[#ff5f5f]" style={{ width: `${p.confidence}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-mono w-8">{p.confidence}%</span>
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[#ff5f5f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        <motion.div variants={item}>
          <div className="mt-8 mb-6">
            <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{/* Schedule */}</div>
            <h2 className="font-display text-[28px] text-gray-900">Upcoming Deadlines</h2>
          </div>
          <EventScheduler
            events={events}
            onAdd={(ev) =>
              setEvents((prev) => [
                ...prev,
                { ...ev, id: `evt-${Date.now()}` },
              ])
            }
            onDelete={(id) =>
              setEvents((prev) => prev.filter((e) => e.id !== id))
            }
          />
        </motion.div>

        <div className="copper-streak" />

        {/* Output chart */}
        <div className="mt-16 grid md:grid-cols-[1fr_240px] gap-8 items-stretch">
          <div className="glass-deep p-6 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{/* Output */}</div>
                <h3 className="font-display text-[20px] text-gray-900">Last 7 days</h3>
              </div>
              <Activity size={16} className="text-gray-300" />
            </div>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,95,95,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,95,95,0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" stroke="rgba(0,0,0,0.15)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(0,0,0,0.15)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #ff5f5f", borderRadius: 8 }} labelStyle={{ color: "#1a1a1a" }} />
                  <Area type="monotone" dataKey="v" stroke="#ff5f5f" strokeWidth={2} fill="url(#g)" dot={{ fill: "#ff5f5f", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-deep p-6 flex flex-col justify-between">
            <div>
              <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{/* Insight */}</div>
              <p className="font-display text-[18px] leading-snug mt-2 text-gray-900">&quot;Tuesday mornings convert 2.3&times; better than Friday afternoons.&quot;</p>
            </div>
            <div className="text-[11px] text-gray-400 mt-4">&mdash; Strategist agent</div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="glass-deep p-10 rounded-3xl mt-12 min-w-0">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ff5f5f]/10 rounded-2xl text-[#ff5f5f]">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Aggregate Swarm Performance</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff5f5f" />
                    <stop offset="100%" stopColor="#ff5f5f" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(0,0,0,0.2)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(255,95,95,0.2)', borderRadius: '16px' }}
                  itemStyle={{ color: '#ff5f5f', fontWeight: 800 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={4} 
                  dot={{ fill: '#ff5f5f', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
