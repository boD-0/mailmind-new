"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Clock, Sparkles, Target, Send as SendIcon, Loader2, UploadIcon } from "lucide-react";
import Link from "next/link";
import { NewProjectDialog, type NewProjectData } from "@/components/dashboard/NewProjectDialog";
import { BulkImportDialog } from "@/components/dashboard/BulkImportDialog";
import { SwarmUsageBar } from "@/components/dashboard/SwarmUsageBar";
import { EmailTrackingPanel } from "@/components/dashboard/EmailTrackingPanel";
import { CampaignAnalytics } from "@/components/dashboard/CampaignAnalytics";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { ProspectsList } from "@/components/dashboard/ProspectsList";
import { CoachingInsights } from "@/components/dashboard/CoachingInsights";
import { authClient } from "@/lib/auth/auth-client";
import { Plan } from "@/lib/auth/gatekeeper";
import { EventScheduler, type ScheduledEvent } from "@/components/ui/event-scheduler";
import { useTranslation } from "@/components/I18nProvider";
import { useParams } from "next/navigation";
import { getDashboardData, type DashboardCampaign } from "@/app/actions/dashboard";

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: "#ff5f5f", label: "Active" },
  swarm_running: { color: "#ff5f5f", label: "Active" },
  review: { color: "#f59e0b", label: "Review" },
  draft: { color: "#c0bdb5", label: "Draft" },
  complete: { color: "#4CAF50", label: "Done" },
  exported: { color: "#4CAF50", label: "Sent" },
};

/* ════════════════════════════════════════════════════════════
   COMPACT STAT PILL
   ════════════════════════════════════════════════════════════ */

function StatPill({ emoji, value, sub }: { emoji: string; value: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm"
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-base">{emoji}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground tracking-tight">{value}</span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   COLLAPSIBLE SECTION (reusable)
   ════════════════════════════════════════════════════════════ */

function CollapsibleSection({
  label,
  count,
  defaultOpen = false,
  children,
}: {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-muted-foreground" />
        </motion.span>
        {label}
        {count !== undefined && (
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([]);
  const [metrics, setMetrics] = useState({ totalCampaigns: 0, avgConfidence: 0, draftsInProgress: 0, sentThisWeek: 0 });
  const [events, setEvents] = useState<ScheduledEvent[]>([
    { id: "1", title: "Arcadia Q2 Launch — final review", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: "deadline" as const },
    { id: "2", title: "Team sync — Q2 campaigns", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), type: "meeting" as const },
    { id: "3", title: "Follow-up: Helix re-engagement", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: "task" as const },
  ]);
  const [dbDeadlines, setDbDeadlines] = useState<ScheduledEvent[]>([]);

  const { data: session } = authClient.useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name || "Founder";
  const userPlan = ((session?.user as { plan?: string } | undefined)?.plan as Plan) || "FREE";

  // Fetch dashboard data from Supabase
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const data = await getDashboardData();
        if (cancelled) return;
        setCampaigns(data.campaigns);
        setMetrics(data.metrics);
        if (data.deadlines.length > 0) {
          setDbDeadlines(data.deadlines.map((d) => ({
            id: d.id,
            title: d.projectName,
            date: new Date(d.deadline),
            type: d.type === "overdue" ? "task" as const : "deadline" as const,
          })));
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Greeting
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    if (h < 12) setGreeting(t("dashboard.greeting_morning"));
    else if (h < 18) setGreeting(t("dashboard.greeting_afternoon"));
    else setGreeting(t("dashboard.greeting_evening"));

    const days = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
    const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];
    setDateStr(`${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  }, [t]);

  // Derived metrics from real data
  const agentCount = userPlan === "FREE" ? 1 : userPlan === "STARTER" ? 2 : 4;
  const campaignCount = campaigns.length;
  const avgConfidence = metrics.avgConfidence || 0;
  const emailsThisWeek = metrics.sentThisWeek || 0;
  const recentCampaigns = campaigns.slice(0, 2);

  // Pipeline counts from real data
  const stageCounts = {
    research: 0,
    draft: campaigns.filter(c => c.status === "draft").length,
    review: campaigns.filter(c => c.status === "review" || c.status === "swarm_running" || c.status === "active").length,
    send: campaigns.filter(c => c.status === "exported" || c.status === "complete").length,
  };
  const pipelineTotal = stageCounts.draft + stageCounts.review + stageCounts.send;

  // Format date helper
  const formatCampaignDate = (iso: string) => {
    const d = new Date(iso);
    const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col max-w-4xl mx-auto px-6 py-6 overflow-hidden">
      <NewProjectDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(data: NewProjectData) => {
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

      <BulkImportDialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImportComplete={() => {
          setBulkImportOpen(false);
          window.location.reload();
        }}
      />

      {/* ── TOP BAR: Greeting + Date + New Campaign ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-6 shrink-0"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {greeting}, <span className="text-copper">{userName}</span>
          </h1>
        </div>          <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <Clock size={11} className="text-muted-foreground/50" />
              {dateStr}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setBulkImportOpen(true)}
            className="flex items-center gap-1.5 bg-white border-2 border-dashed border-emerald-300 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          >
            <UploadIcon size={15} />
            Import CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 bg-copper text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-copper/80 transition-colors shadow-sm hover:shadow-md hover:shadow-copper/20"
          >
            <Plus size={15} />
            {t("dashboard.new_campaign")}
          </motion.button>
        </div>
      </motion.div>

      {/* ── STATS PILLS ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-4 shrink-0"
      >
        <StatPill emoji="📧" value={`${emailsThisWeek}`} sub="săptămâna asta" />
        <StatPill emoji="🎯" value={`${avgConfidence}%`} sub="încredere medie" />
        <StatPill emoji="🤖" value={`${agentCount}`} sub={agentCount === 1 ? "agent activ" : "agenți activi"} />
        <StatPill emoji="📬" value={`${campaignCount}`} sub="campanii" />
      </motion.div>

      {/* ── SWARM USAGE BAR ── */}
      <div className="mb-6 shrink-0">
        <SwarmUsageBar />
      </div>

      {/* ── MAIN CONTENT: scrollable area ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <>
            {/* ── PIPELINE (collapsible) ── */}
            <CollapsibleSection label="Pipeline" count={pipelineTotal}>
              <div className="space-y-3">
                {/* Colored progress bar */}
                <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                  {pipelineTotal > 0 && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-indigo-400 to-rose-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${pipelineTotal > 0 ? Math.round(((stageCounts.draft * 25) + (stageCounts.review * 50) + (stageCounts.send * 100)) / pipelineTotal) : 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  )}
                  {/* Floating sparkle on the leading edge */}
                  {pipelineTotal > 0 && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-purple-400 shadow-sm z-10"
                      initial={{ left: "0%" }}
                      animate={{
                        left: [`0%`, `${pipelineTotal > 0 ? Math.round(((stageCounts.draft * 25) + (stageCounts.review * 50) + (stageCounts.send * 100)) / pipelineTotal) : 0}%`],
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-purple-400"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                  )}
                </div>
                {/* Stage cards */}
                <div className="flex gap-3">
                  {[
                    { key: "research", icon: Target, iconBg: "bg-emerald-100 text-emerald-600", borderHover: "hover:border-emerald-300 hover:shadow-emerald-100/50", label: "Research", count: stageCounts.research },
                    { key: "draft", icon: SendIcon, iconBg: "bg-amber-100 text-amber-600", borderHover: "hover:border-amber-300 hover:shadow-amber-100/50", label: "Draft", count: stageCounts.draft },
                    { key: "review", icon: Sparkles, iconBg: "bg-indigo-100 text-indigo-600", borderHover: "hover:border-indigo-300 hover:shadow-indigo-100/50", label: "Review", count: stageCounts.review },
                    { key: "send", icon: SendIcon, iconBg: "bg-rose-100 text-rose-600", borderHover: "hover:border-rose-300 hover:shadow-rose-100/50", label: "Trimise", count: stageCounts.send },
                  ].map((stage) => (
                    <motion.div
                      key={stage.key}
                      whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
                      className={`flex-1 bg-white rounded-xl border border-border p-3 text-center transition-all duration-300 ${stage.borderHover} hover:shadow-md cursor-default relative overflow-hidden group`}
                    >
                      {/* Subtle hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/0 group-hover:to-gray-50/80 transition-all duration-300" />
                      <motion.div
                        className={`w-9 h-9 rounded-xl ${stage.iconBg} flex items-center justify-center mx-auto mb-1.5 relative z-10`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                      >
                        <stage.icon size={15} />
                      </motion.div>
                      <div className="text-xs font-semibold text-foreground/80 relative z-10">{stage.label}</div>
                      <motion.div
                        className="text-lg font-bold text-foreground relative z-10"
                        initial={false}
                        key={`${stage.key}-${stage.count}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        {stage.count}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* ── RECENT CAMPAIGNS (only 2) ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t("dashboard.campaigns_title")}
                </h3>
                <Link href={`/${l}/dashboard/ideas`} className="text-[11px] text-muted-foreground hover:text-copper transition-colors">
                  {t("dashboard.campaign_view_all")} →
                </Link>
              </div>
              {recentCampaigns.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl border border-dashed border-amber-200 p-6 text-center"
                >
                  <motion.span
                    className="text-3xl mb-2 block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                  <div className="text-sm font-semibold text-amber-700">{t("dashboard.no_campaigns")}</div>
                  <div className="text-[11px] text-amber-500 mt-1">{t("dashboard.no_campaigns_hint")}</div>
                </motion.div>
              ) : (
              <div className="grid grid-cols-2 gap-3">
                {recentCampaigns.map((c) => {
                  const s = STATUS_MAP[c.status] ?? STATUS_MAP.draft!;
                  const confidenceEmoji = c.confidence_score >= 80 ? "🔥" : c.confidence_score >= 60 ? "✨" : c.confidence_score >= 40 ? "💪" : "🌱";
                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`/${l}/dashboard/war-room/${c.id}`}
                        className="group block bg-white rounded-2xl border border-border p-4 hover:border-copper/30 hover:shadow-lg hover:shadow-copper/10 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Warm gradient hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 via-amber-50/0 to-rose-50/0 group-hover:from-red-50/30 group-hover:via-amber-50/20 group-hover:to-rose-50/30 transition-all duration-500" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-foreground truncate group-hover:text-copper transition-colors">
                                {c.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">{c.prospect_name || "—"}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <motion.span
                                className="shrink-0 w-2.5 h-2.5 rounded-full"
                                style={{ background: s.color }}
                                animate={c.status === "swarm_running" || c.status === "active" ? { boxShadow: [`0 0 4px ${s.color}`, `0 0 10px ${s.color}`, `0 0 4px ${s.color}`] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-full">{formatCampaignDate(c.created_at)}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-copper"
                                  initial={{ width: "0%" }}
                                  whileInView={{ width: `${c.confidence_score}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                                {confidenceEmoji} {c.confidence_score}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              )}
            </div>

            {/* ── ONBOARDING CHECKLIST ── */}
            <div className="mb-4">
              <OnboardingChecklist />
            </div>

            {/* ── AI COACHING INSIGHTS ── */}
            <div className="mb-4">
              <CoachingInsights />
            </div>

            {/* ── PROSPECT DATABASE ── */}
            <CollapsibleSection label={t("prospects.title") || "Prospect Database"} count={0}>
              <ProspectsList />
            </CollapsibleSection>

            {/* ── EMAIL TRACKING ── */}
            <div className="mb-4">
              <EmailTrackingPanel />
            </div>

            {/* ── CAMPAIGN ANALYTICS ── */}
            <div className="mb-4">
              <CampaignAnalytics />
            </div>

            {/* ── DEADLINES (collapsible) ── */}
            <CollapsibleSection label={t("dashboard.deadlines_title")} count={events.length + dbDeadlines.length}>
              <EventScheduler
                events={[...dbDeadlines, ...events]}
                onAdd={(ev) => setEvents((prev) => [...prev, { ...ev, id: `evt-${Date.now()}` }])}
                onDelete={(id) => {
                  setEvents((prev) => prev.filter((e) => e.id !== id));
                  setDbDeadlines((prev) => prev.filter((e) => e.id !== id));
                }}
              />
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}
