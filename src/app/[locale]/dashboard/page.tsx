"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, Activity, Search, Brain, Target, PenTool, Send as SendIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { NewProjectDialog, type NewProjectData } from "@/components/dashboard/NewProjectDialog";
import { authClient } from "@/lib/auth/auth-client";
import { Plan } from "@/lib/auth/gatekeeper";

import { EventScheduler, type ScheduledEvent } from "@/components/ui/event-scheduler";
import { useSwarmStore } from "@/stores/swarmStore";
import { useTranslation } from "@/components/I18nProvider";
import { useParams } from "next/navigation";

// Dynamic chart imports
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });

/* ════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ════════════════════════════════════════════════════════════ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fadeUpScale = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  show: (delay = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay },
  }),
} as const;

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const CHART = [
  { d: "Sat", v: 3 }, { d: "Sun", v: 1 }, { d: "Mon", v: 6 },
  { d: "Tue", v: 11 }, { d: "Wed", v: 7 }, { d: "Thu", v: 9 }, { d: "Fri", v: 8 },
];

const PIPELINE_STAGES = [
  { key: "research", icon: Search, color: "emerald", labelKey: "dashboard.pipeline_research", descKey: "dashboard.pipeline_research_desc" },
  { key: "draft", icon: PenTool, color: "amber", labelKey: "dashboard.pipeline_draft", descKey: "dashboard.pipeline_draft_desc" },
  { key: "review", icon: Brain, color: "indigo", labelKey: "dashboard.pipeline_review", descKey: "dashboard.pipeline_review_desc" },
  { key: "send", icon: SendIcon, color: "rose", labelKey: "dashboard.pipeline_send", descKey: "dashboard.pipeline_send_desc" },
] as const;

// Mock campaigns — will be replaced by DB data
const CAMPAIGNS = [
  { id: "arcadia-q2", name: "Q2 Product Launch", company: "Arcadia Finance", stage: "review", confidence: 93, date: "May 6" },
  { id: "northstack-onboard", name: "Onboarding Sequence", company: "NorthStack", stage: "draft", confidence: 71, date: "May 4" },
  { id: "helix-reengagement", name: "Re-engagement Flow", company: "Helix Capital", stage: "complete", confidence: 88, date: "Apr 30" },
  { id: "bioforge-webinar", name: "Webinar Follow-up", company: "BioForge", stage: "active", confidence: 84, date: "Apr 28" },
  { id: "tundra-investor", name: "Investor Update", company: "Tundra VC", stage: "complete", confidence: 91, date: "Apr 26" },
  { id: "solera-promo", name: "Spring Promo", company: "Solera Retail", stage: "draft", confidence: 62, date: "Apr 24" },
];

/* ════════════════════════════════════════════════════════════
   STATUS DOT
   ════════════════════════════════════════════════════════════ */

const STATUS_MAP: Record<string, { color: string; labelKey: string }> = {
  active: { color: "#ff5f5f", labelKey: "dashboard.campaign_status_active" },
  review: { color: "#f59e0b", labelKey: "dashboard.campaign_status_review" },
  draft: { color: "#c0bdb5", labelKey: "dashboard.campaign_status_draft" },
  complete: { color: "#4CAF50", labelKey: "dashboard.campaign_status_complete" },
};

function StatusDot({ stage }: { stage: string }) {
  const { t } = useTranslation();
  const s = STATUS_MAP[stage] ?? STATUS_MAP.draft!;
  return (
    <span className="text-[10px] tracking-widest text-gray-400 flex items-center gap-1.5 uppercase">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: stage === "active" ? `0 0 8px ${s.color}` : "none" }} />
      {t(s.labelKey)}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   PIPELINE STAGE CARD
   ════════════════════════════════════════════════════════════ */

const STAGE_COLORS: Record<string, { bg: string; iconBg: string; border: string }> = {
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-amber-600", border: "border-amber-200" },
  indigo: { bg: "bg-indigo-50", iconBg: "bg-indigo-100 text-indigo-600", border: "border-indigo-200" },
  rose: { bg: "bg-rose-50", iconBg: "bg-rose-100 text-rose-600", border: "border-rose-200" },
};

const STAGE_BARS: Record<string, string> = {
  emerald: "#34d399",
  amber: "#fbbf24",
  indigo: "#6366f1",
  rose: "#f43f5e",
};

function PipelineCard({
  stage, index, count, total,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  index: number;
  count: number;
  total: number;
}) {
  const { t } = useTranslation();
  const Icon = stage.icon;
  const c = STAGE_COLORS[stage.color] ?? STAGE_COLORS.emerald!;
  return (
    <motion.div
      variants={fadeUpScale}
      custom={index * 0.08}
      className={`${c.bg} border ${c.border} rounded-2xl p-5 flex flex-col items-center text-center gap-3 relative overflow-hidden group cursor-default shadow-sm`}
      whileHover={{ y: -5, boxShadow: "0 12px 28px rgba(0,0,0,0.06)", transition: { duration: 0.25 } }}
    >
      <motion.div
        className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center`}
        whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1 }}
        transition={{ duration: 0.4 }}
      >
        <Icon size={20} />
      </motion.div>
      <div>
        <span className="text-xs font-bold tracking-wide text-gray-800">{t(stage.labelKey)}</span>
        <p className="text-[10px] text-gray-400 mt-0.5">{t(stage.descKey)}</p>
      </div>
      <div className="mt-1">
        <span className="text-2xl font-extrabold text-gray-900">{count}</span>
        <span className="text-[10px] text-gray-400 ml-1">campaigns</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200/60 rounded-full overflow-hidden mt-1">
        <motion.div
          className="h-full rounded-full"
          style={{ background: STAGE_BARS[stage.color] ?? "#34d399" }}
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${Math.round((count / Math.max(total, 1)) * 100)}%` : "0%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════════ */

function Hero({
  userName, onNewCampaign, agentCount,
}: {
  userName: string;
  onNewCampaign: () => void;
  agentCount: number;
}) {
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    if (h < 12) setGreeting(t("dashboard.greeting_morning"));
    else if (h < 18) setGreeting(t("dashboard.greeting_afternoon"));
    else setGreeting(t("dashboard.greeting_evening"));

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setDateStr(`${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()} · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  }, [t]);

  return (
    <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-end">
      <motion.div variants={item}>
        <div className="text-[11px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-3 font-mono">{dateStr}</div>
        <h1 className="font-display text-[44px] leading-[1.05] text-gray-900">
          {greeting}, {userName || "Founder"}.<br />
          <span className="text-gray-400 italic">
            {agentCount > 0 ? `${agentCount} ${t("dashboard.agents_awake")}` : t("dashboard.agents_asleep")}
          </span>
        </h1>
      </motion.div>
      <motion.button
        variants={item}
        onClick={onNewCampaign}
        className="group relative overflow-hidden self-end px-6 py-4 border border-[#ff5f5f] text-[#ff5f5f] rounded-md text-[13px] tracking-wider uppercase flex items-center justify-between gap-3 hover:bg-[#ff5f5f]/10 transition-colors"
      >
        <span className="flex items-center gap-2"><Plus size={15} /> {t("dashboard.new_campaign")}</span>
        <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </motion.button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   METRICS ROW
   ════════════════════════════════════════════════════════════ */

function MetricsRow({ emailsDrafted, avgConfidence, agentCount, campaignCount }: {
  emailsDrafted: number;
  avgConfidence: number;
  agentCount: number;
  campaignCount: number;
}) {
  const { t } = useTranslation();
  const metrics = [
    { label: t("dashboard.metrics_emails"), value: `${emailsDrafted}`, sub: "this week", icon: <Sparkles size={14} className="text-[#ff5f5f]" /> },
    { label: t("dashboard.metrics_confidence"), value: `${avgConfidence}%`, sub: "agent average", color: "#f59e0b" },
    { label: t("dashboard.metrics_agents"), value: `${agentCount}`, sub: "active", color: "#6366f1" },
    { label: t("dashboard.metrics_campaigns"), value: `${campaignCount}`, sub: "total", color: "#4CAF50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#ff5f5f]/10 rounded-md overflow-hidden">
      {metrics.map((m) => (
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
  );
}

/* ════════════════════════════════════════════════════════════
   PIPELINE SECTION
   ════════════════════════════════════════════════════════════ */

function PipelineSection() {
  const { t } = useTranslation();

  // Compute how many campaigns are in each stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { research: 0, draft: 0, review: 0, send: 0 };
    CAMPAIGNS.forEach((c) => {
      if (c.stage === "draft") counts.draft = (counts.draft ?? 0) + 1;
      else if (c.stage === "active" || c.stage === "review") counts.review = (counts.review ?? 0) + 1;
      else if (c.stage === "complete") counts.send = (counts.send ?? 0) + 1;
      else if (c.stage === "research") counts.research = (counts.research ?? 0) + 1;
    });
    return counts;
  }, []);

  const total = CAMPAIGNS.length;

  return (
    <motion.div variants={item}>
      <div className="mt-10 mb-6">
        <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{t("dashboard.pipeline_label")}</div>
        <h2 className="font-display text-[28px] text-gray-900">
          {t("dashboard.pipeline_title")}{" "}
          <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">{t("dashboard.pipeline_highlight")}</span>
        </h2>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {PIPELINE_STAGES.map((stage, i) => {
          const count = stageCounts[stage.key] ?? 0;
          return <PipelineCard key={stage.key} stage={stage} index={i} count={count} total={total} />;
        })}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   ACTIVE CAMPAIGNS
   ════════════════════════════════════════════════════════════ */

function CampaignsSection({ locale }: { locale: string }) {
  const { t } = useTranslation();

  return (
    <motion.div variants={item}>
      <div className="mt-14 flex items-end justify-between">
        <div>
          <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{t("dashboard.campaigns_label")}</div>
          <h2 className="font-display text-[28px] text-gray-900">
            {t("dashboard.campaigns_title")}{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">{t("dashboard.campaigns_highlight")}</span>
          </h2>
        </div>
        <Link href={`/${locale}/dashboard/ideas`} className="text-[12px] text-gray-400 hover:text-[#ff5f5f] transition-colors">
          {t("dashboard.campaign_view_all")} →
        </Link>
      </div>

      {CAMPAIGNS.length === 0 ? (
        <div className="mt-10 text-center py-16 glass-deep rounded-2xl">
          <Target size={32} className="text-[#ff5f5f] mx-auto opacity-40" />
          <p className="text-gray-400 text-sm mt-4">{t("dashboard.campaigns_empty")}</p>
        </div>
      ) : (
        <div className="mt-6 border-t border-gray-200">
          {CAMPAIGNS.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/dashboard/war-room/${c.id}`}
              className="group grid grid-cols-[1fr_1fr_100px_120px_24px] gap-6 items-center px-2 py-5 border-b border-gray-100 hover:bg-[#ff5f5f]/5 transition-colors"
            >
              <div>
                <div className="font-display text-[17px] text-gray-900 group-hover:text-[#ff5f5f] transition-colors">{c.name}</div>
                <div className="text-[12px] text-gray-400">{c.company}</div>
              </div>
              <div className="text-[12px] text-gray-400 font-mono">{c.date}</div>
              <StatusDot stage={c.stage} />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[2px] bg-gray-200 relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-[#ff5f5f]" style={{ width: `${c.confidence}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-mono w-8">{c.confidence}%</span>
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[#ff5f5f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   SWARM ACTIVITY FEED
   ════════════════════════════════════════════════════════════ */

const agentIcons: Record<string, React.FC<{ size?: number }>> = {
  researcher: Search,
  psychologist: Brain,
  strategist: Target,
  copywriter: PenTool,
};

const agentColorMap: Record<string, string> = {
  researcher: "bg-emerald-100 text-emerald-600",
  psychologist: "bg-amber-100 text-amber-600",
  strategist: "bg-indigo-100 text-indigo-600",
  copywriter: "bg-rose-100 text-rose-600",
};

const agentDisplayNames: Record<string, string> = {
  researcher: "Researcher",
  psychologist: "Psychologist",
  strategist: "Strategist",
  copywriter: "Copywriter",
};

function SwarmActivityFeed() {
  const { t } = useTranslation();
  const traceLogs = useSwarmStore((s) => s.traceLogs);

  return (
    <motion.div variants={item} className="glass-deep p-6 min-w-0">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{t("dashboard.activity_label")}</div>
          <h3 className="font-display text-[20px] text-gray-900">
            {t("dashboard.activity_title")}{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">{t("dashboard.activity_highlight")}</span>
          </h3>
        </div>
        <Activity size={16} className="text-gray-300" />
      </div>

      {traceLogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">{t("dashboard.activity_empty")}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar">
          {traceLogs.slice(-8).reverse().map((msg, i) => {
            const agentName = msg.agent || "Agent";
            const Icon = agentIcons[agentName] || Sparkles;
            const colorClass = agentColorMap[agentName] || "bg-gray-100 text-gray-500";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-gray-700">{agentDisplayNames[agentName] ?? agentName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed truncate">{msg.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { locale } = useParams();
  const l = locale as string;
  const { t } = useTranslation();

  const [newOpen, setNewOpen] = useState(false);
  const [events, setEvents] = useState<ScheduledEvent[]>([
    { id: "1", title: "Arcadia Q2 Launch — final review", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: "deadline" as const },
    { id: "2", title: "Team sync — Q2 campaigns", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), type: "meeting" as const },
    { id: "3", title: "Follow-up: Helix re-engagement", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: "task" as const },
  ]);

  const { data: session } = authClient.useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name || "Founder";
  const userPlan = ((session?.user as { plan?: string } | undefined)?.plan as Plan) || "FREE";

  // Compute derived metrics
  const agentCount = userPlan === "FREE" ? 1 : userPlan === "STARTER" ? 2 : 4;
  const campaignCount = CAMPAIGNS.length;
  const avgConfidence = Math.round(CAMPAIGNS.reduce((sum, c) => sum + c.confidence, 0) / CAMPAIGNS.length);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <NewProjectDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(data: NewProjectData) => {
          console.log("create", data);
          const dl = data.deadline;
          if (dl) {
            setEvents((prev) => [
              ...prev,
              { id: `proj-${Date.now()}`, title: `${data.name} – ${data.company}`, date: dl, type: "deadline" as const },
            ]);
          }
        }}
        userPlan={userPlan}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
        {/* Hero */}
        <Hero userName={userName} onNewCampaign={() => setNewOpen(true)} agentCount={agentCount} />

        <div className="copper-streak mt-10" />

        {/* Metrics */}
        <MetricsRow emailsDrafted={CAMPAIGNS.length} avgConfidence={avgConfidence} agentCount={agentCount} campaignCount={campaignCount} />

        {/* Pipeline */}
        <PipelineSection />

        {/* Active Campaigns */}
        <CampaignsSection locale={l} />

        <div className="copper-streak" />

        {/* Swarm Activity + Chart */}
        <div className="grid md:grid-cols-[1fr_280px] gap-8 items-stretch mt-8">
          {/* Activity Feed */}
          <SwarmActivityFeed />

          {/* Weekly Output Chart */}
          <div className="glass-deep p-6">
            <div>
              <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{t("dashboard.activity_label")}</div>
              <h3 className="font-display text-[18px] text-gray-900">{t("dashboard.chart_title")}</h3>
            </div>
            <div className="h-[180px] w-full mt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,95,95,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,95,95,0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" stroke="rgba(0,0,0,0.15)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(0,0,0,0.15)" fontSize={10} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #ff5f5f", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#1a1a1a" }} />
                  <Area type="monotone" dataKey="v" stroke="#ff5f5f" strokeWidth={2} fill="url(#g)" dot={{ fill: "#ff5f5f", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="font-display text-[13px] leading-snug mt-4 text-gray-900">{t("dashboard.chart_insight")}</p>
            <div className="text-[11px] text-gray-400 mt-1">{t("dashboard.chart_attribution")}</div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <motion.div variants={item}>
          <div className="mt-8 mb-6">
            <div className="text-[10px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-1 font-mono">{t("dashboard.deadlines_label")}</div>
            <h2 className="font-display text-[28px] text-gray-900">{t("dashboard.deadlines_title")}</h2>
          </div>
          <EventScheduler
            events={events}
            onAdd={(ev) => setEvents((prev) => [...prev, { ...ev, id: `evt-${Date.now()}` }])}
            onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
          />
        </motion.div>

      </motion.div>
    </div>
  );
}
