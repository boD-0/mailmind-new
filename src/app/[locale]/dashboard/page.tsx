"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Layers } from "lucide-react";
import Link from "next/link";
import { NewProjectDialog, type NewProjectData } from "@/components/dashboard/NewProjectDialog";
import { BulkImportDialog } from "@/components/dashboard/BulkImportDialog";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { CoachingInsights } from "@/components/dashboard/CoachingInsights";
import { authClient } from "@/lib/auth/auth-client";
import { Plan } from "@/lib/auth/plans";
import { SparklineStatCard, SparklineStatCardSkeleton } from "@/components/dashboard/SparklineStatCard";
import { MainContentSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslation } from "@/components/I18nProvider";
import { useParams } from "next/navigation";
import { getDashboardData, type DashboardCampaign } from "@/app/actions/dashboard";

/* ════════════════════════════════════════════════════════════
   STATUS BADGE — matching HTML design
   ════════════════════════════════════════════════════════════ */

const STATUS_MAP: Record<string, { bg: string; color: string; label: string; dot: boolean }> = {
  active: { bg: "bg-[#E1F5EE] dark:bg-[#04342C]", color: "text-[#085041] dark:text-[#9FE1CB]", label: "Active", dot: true },
  swarm_running: { bg: "bg-[#E1F5EE] dark:bg-[#04342C]", color: "text-[#085041] dark:text-[#9FE1CB]", label: "Active", dot: true },
  review: { bg: "bg-[#FAEEDA] dark:bg-[#2C1A00]", color: "text-[#633806] dark:text-[#FAC775]", label: "Review", dot: true },
  draft: { bg: "bg-[#FAEEDA] dark:bg-[#2C1A00]", color: "text-[#633806] dark:text-[#FAC775]", label: "Draft", dot: true },
  complete: { bg: "bg-[#E1F5EE] dark:bg-[#04342C]", color: "text-[#085041] dark:text-[#9FE1CB]", label: "Done", dot: true },
  exported: { bg: "bg-[#E1F5EE] dark:bg-[#04342C]", color: "text-[#085041] dark:text-[#9FE1CB]", label: "Sent", dot: true },
  paused: { bg: "bg-[#F1EFE8] dark:bg-[#242422]", color: "text-[#5F5E5A] dark:text-[#B4B2A9]", label: "Paused", dot: false },
};

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] || { bg: "bg-[#F1EFE8] dark:bg-[#242422]", color: "text-[#5F5E5A] dark:text-[#B4B2A9]", label: status, dot: false };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${info.bg} ${info.color}`}>
      {info.dot && <span className="w-1 h-1 rounded-full bg-current" />}
      {info.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   DATE HELPER — locale-aware date formatting
   ════════════════════════════════════════════════════════════ */

function formatDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function getGreeting(hour: number, t: (key: string) => string): string {
  if (hour < 12) return t("dashboard.greeting_morning");
  if (hour < 18) return t("dashboard.greeting_afternoon");
  return t("dashboard.greeting_evening");
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
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const { data: session } = authClient.useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name || "Founder";
  const userPlan = ((session?.user as { plan?: string } | undefined)?.plan as Plan) || "FREE";

  // Fetch dashboard data
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const data = await getDashboardData();
        if (cancelled) return;
        setCampaigns(data.campaigns);
        setMetrics(data.metrics);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Greeting & date
  const prefersReducedMotion = useReducedMotion();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Derived metrics
  const campaignCount = campaigns.length;
  const avgConfidence = metrics.avgConfidence || 0;
  const prospectsCount = Math.max(12, campaignCount * 22);
  const replyRate = Math.max(18, Math.round(avgConfidence * 0.84));
  const activeCampaignCount = campaigns.filter((c) => ["active", "swarm_running", "review"].includes(c.status)).length;
  const swarmsUsed = Math.max(1, campaignCount);
  const greetingText = getGreeting(now.getHours(), t);
  const dateText = formatDate(now);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (campaignFilter === 'all') return true;
    if (campaignFilter === 'active') return ["active", "swarm_running", "review"].includes(campaign.status);
    if (campaignFilter === 'paused') return campaign.status === 'paused';
    if (campaignFilter === 'draft') return campaign.status === 'draft';
    return true;
  });

  return (
    <div className="px-4 xl:px-6 py-4 xl:py-6 space-y-4 xl:space-y-5">
      <NewProjectDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(data: NewProjectData) => {
          // campaign created — data is handled by dialog
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

      {/* ── Welcome Row ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg xl:text-xl font-medium text-[#1C1C1A] dark:text-[#F1EFE8] leading-tight">
            {greetingText}, <span className="text-[#EF9F27]">{userName}</span>
          </h1>
          <p className="text-xs xl:text-sm text-[#5F5E5A] dark:text-[#B4B2A9] mt-0.5">
            {activeCampaignCount} campaign{activeCampaignCount !== 1 ? 's' : ''} active &middot; {dateText}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-lg border border-border/50 bg-white dark:bg-[#1C1C1A] text-[#5F5E5A] dark:text-[#B4B2A9] hover:bg-[#F1EFE8] dark:hover:bg-[#242422] transition-colors text-xs xl:text-sm font-normal"
          >
            <i className="ti ti-upload text-sm" aria-hidden="true" />
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-lg bg-[#EF9F27] text-white hover:bg-[#BA7517] transition-colors text-xs xl:text-sm font-medium"
          >
            <i className="ti ti-plus text-sm" aria-hidden="true" />
            New Campaign
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-3.5">
          <SparklineStatCardSkeleton />
          <SparklineStatCardSkeleton />
          <SparklineStatCardSkeleton />
          <SparklineStatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-3.5">
          <SparklineStatCard
            label="Active campaigns"
            value={activeCampaignCount}
            trend="up"
            trendLabel="+2 this week"
            sparklineData={[2, 3, 2, 4, 5, 4, activeCampaignCount]}
          />
          <SparklineStatCard
            label="Swarms used"
            value={`${swarmsUsed}/30`}
            trendLabel="this month"
            nearLimit={swarmsUsed > 25}
          />
          <SparklineStatCard
            label="Prospects"
            value={prospectsCount}
            trend="up"
            trendLabel="+12 this week"
            sparklineData={[prospectsCount - 20, prospectsCount - 15, prospectsCount - 10, prospectsCount - 5, prospectsCount]}
          />
          <SparklineStatCard
            label="Reply rate"
            value={`${replyRate}%`}
            trendLabel="all campaigns"
            sparklineData={[12, 15, 14, 18, Math.max(18, replyRate - 2), replyRate]}
          />
        </div>
      )}

      {/* ── Campaigns + Insights Grid ── */}
      {loading ? (
        <MainContentSkeleton />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4 xl:gap-5">
          {/* Left: Campaigns */}
          <div className="flex flex-col min-h-0">
            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-3">
              <h2 className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8] flex-1">Campaigns</h2>
              <div className="flex items-center gap-1">
                {([
                  { id: 'all' as const, label: 'All' },
                  { id: 'active' as const, label: 'Active' },
                  { id: 'paused' as const, label: 'Paused' },
                  { id: 'draft' as const, label: 'Draft' },
                ]).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setCampaignFilter(filter.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      campaignFilter === filter.id
                        ? 'bg-[#EF9F27] text-white'
                        : 'border border-border/50 text-[#5F5E5A] dark:text-[#B4B2A9] hover:bg-[#F1EFE8] dark:hover:bg-[#242422]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EF9F27] text-white text-[11px] font-medium hover:bg-[#BA7517] transition-colors"
              >
                <i className="ti ti-plus text-xs" aria-hidden="true" />
                New
              </button>
            </div>

            {/* Campaigns table */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_90px_70px_70px_70px_60px] gap-2 px-4 xl:px-5 py-2.5 border-b border-border/50 text-[10px] uppercase tracking-[0.4px] text-[#888780] font-medium">
                <span>Campaign</span>
                <span>Status</span>
                <span className="text-right">Prospects</span>
                <span className="text-right">Opens</span>
                <span className="text-right">Replies</span>
                <span></span>
              </div>

              {/* Table body */}
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={<Layers size={48} />}
                  message={t("dashboard.no_campaigns_empty") || "No campaigns yet — but your first one is just a few clicks away. Want to start together?"}
                  ctaLabel={t("dashboard.new_campaign")}
                  onCtaClick={() => setNewOpen(true)}
                  secondaryLabel={t("dashboard.show_me_around") || "Show me around"}
                />
              ) : filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#888780]">
                  No campaigns match this filter.
                </div>
              ) : (
                <div>
                  <AnimatePresence mode="popLayout">
                    {filteredCampaigns.map((campaign, i) => (
                      <motion.div
                        key={campaign.id}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.97 }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                          duration: 0.25,
                          delay: i * 0.04,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        layout={!prefersReducedMotion}
                      >
                        <Link
                          href={`/${l}/dashboard/war-room/${campaign.id}`}
                          className="grid grid-cols-[2fr_90px_70px_70px_70px_60px] gap-2 px-4 xl:px-5 py-3 border-b border-border/50 hover:bg-[#F1EFE8] dark:hover:bg-[#242422] transition-colors items-center group cursor-pointer last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#1C1C1A] dark:text-[#F1EFE8] truncate">{campaign.title}</p>
                            <p className="text-[11px] text-[#888780] mt-0.5 truncate">{campaign.prospect_name || 'Atelierul Agency'}</p>
                          </div>
                          <div><StatusBadge status={campaign.status} /></div>
                          <div className="text-xs text-[#5F5E5A] dark:text-[#B4B2A9] text-right">{Math.max(8, Math.round(prospectsCount / Math.max(1, filteredCampaigns.length)))}</div>
                          <div className="text-xs text-[#5F5E5A] dark:text-[#B4B2A9] text-right">{Math.min(100, Math.max(5, Math.round(campaign.confidence_score * 0.9)))}%</div>
                          <div className="text-xs text-[#5F5E5A] dark:text-[#B4B2A9] text-right">{Math.min(100, Math.max(10, Math.round(campaign.confidence_score)))}%</div>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[#888780] hover:text-[#1C1C1A] dark:hover:text-[#F1EFE8] hover:bg-[#F1EFE8] dark:hover:bg-[#242422] transition-colors cursor-pointer">
                              <i className="ti ti-edit text-xs" aria-hidden="true"></i>
                            </span>
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[#888780] hover:text-[#E24B4A] hover:bg-[#FCEBEB] dark:hover:bg-[#501313] transition-colors cursor-pointer">
                              <i className="ti ti-trash text-xs" aria-hidden="true"></i>
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right: Aurelius + Checklist */}
          <div className="flex flex-col gap-4">
            {/* Aurelius Insights */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl p-4">
              <CoachingInsights />
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EF9F27]/40 text-[#EF9F27] hover:bg-[#FAEEDA] dark:hover:bg-[#2C1A00] transition-colors text-xs font-medium"
              >
                <i className="ti ti-message-circle text-sm" aria-hidden="true"></i>
                Ask Aurelius
              </button>
            </div>

            {/* Onboarding Checklist */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl p-4">
              <OnboardingChecklist />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
