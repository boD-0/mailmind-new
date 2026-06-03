"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  User, Building2, Target, Mic, FileText, Hash, Heart,
  AlertTriangle, CheckCircle2, Save, Loader2, Mail, Crown,
  Unplug, ExternalLink, Download, Trash2, Shield, Users,
  CreditCard, Bell, Key, Plus, ArrowRight,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unusedIcons = [Target, Mic, FileText, Hash, Heart];
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { getUserProfile, updateProfileName, updateBrandProfile, type BrandProfile } from "@/app/actions/profile";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/I18nProvider";
import { toast } from "sonner";

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */

const BRAND_VALUES = [
  "Authority", "Empathy", "Innovation", "Clarity",
  "Exclusivity", "Speed", "Trust", "Bold",
  "Data-Driven", "Visionary", "Direct", "Premium",
];

const TONES = [
  { value: "formal", label: "Formal · Executive" },
  { value: "balanced", label: "Balanced · Professional" },
  { value: "warm", label: "Warm · Approachable" },
  { value: "casual", label: "Casual · Founder-to-Founder" },
];

const PAIN_POINTS_PRESET = [
  "Low response rates", "Generic emails feel spammy",
  "Too many tools, no workflow", "Can't scale personalization",
  "Hard to track prospect research", "Team collaboration is messy",
  "No data-driven copy decisions", "Templates feel robotic",
];

const SETTINGS_NAV = [
  { id: "profile", label: "Profile", icon: "ti ti-user" },
  { id: "brand", label: "Brand Voice", icon: "ti ti-writing" },
  { id: "integrations", label: "Integrations", icon: "ti ti-plug" },
  { id: "team", label: "Team", icon: "ti ti-users" },
  { id: "billing", label: "Billing", icon: "ti ti-credit-card" },
  { id: "notifications", label: "Notifications", icon: "ti ti-bell" },
  { id: "api-keys", label: "API Keys", icon: "ti ti-key" },
  { id: "privacy", label: "Privacy & Data", icon: "ti ti-shield" },
];

type GmailStatus = { connected: boolean; googleEmail?: string };
type ProfileData = { name: string; email: string; plan: string; brand: BrandProfile | null };

/* ════════════════════════════════════════════════════════════
   COMPONENTS
   ════════════════════════════════════════════════════════════ */

function SectionCard({ icon, title, subtitle, children, className }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white dark:bg-[#1C1C1A] border border-border/50 rounded-xl overflow-hidden", className)}
    >
      <div className="px-5 xl:px-6 pt-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAEEDA] dark:bg-[#2C1A00] flex items-center justify-center text-[#BA7517] dark:text-[#FAC775]">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">{title}</h3>
            {subtitle && <p className="text-[11px] text-[#888780] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 xl:px-6 py-5">{children}</div>
    </motion.div>
  );
}

function PillButton({ selected, onClick, children }: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[11px] px-3 py-1.5 rounded-full border transition-all",
        selected
          ? "border-[#EF9F27] text-[#EF9F27] bg-[#FAEEDA] dark:bg-[#2C1A00]"
          : "border-border/50 text-[#5F5E5A] dark:text-[#B4B2A9] hover:text-[#1C1C1A] dark:hover:text-[#F1EFE8] hover:border-[#EF9F27]/30",
      )}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   SETTINGS NAV SIDEBAR
   ════════════════════════════════════════════════════════════ */

function SettingsNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <nav className="w-44 xl:w-48 shrink-0 hidden md:block">
      <div className="space-y-0.5 sticky top-20">
        {SETTINGS_NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left",
              active === item.id
                ? "bg-[#FAEEDA] dark:bg-[#2C1A00] text-[#BA7517] dark:text-[#FAC775] font-medium"
                : "text-[#5F5E5A] dark:text-[#B4B2A9] hover:text-[#1C1C1A] dark:hover:text-[#F1EFE8] hover:bg-[#F1EFE8] dark:hover:bg-[#242422]",
            )}
          >
            <i className={cn(item.icon, "text-sm")} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form state – profile
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Form state – brand
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [context, setContext] = useState("");
  const [brandValues, setBrandValues] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [savingBrand, setSavingBrand] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);

  // Gmail connection state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [gmailLoading, setGmailLoading] = useState(true);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailDisconnecting, setGmailDisconnecting] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    replies: true, swarm: true, trial: true, digest: false,
  });

  // GDPR state
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Gmail connection ──
  const fetchGmailStatus = async () => {
    setGmailLoading(true);
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      setGmailStatus(data as GmailStatus);
      setGmailError(null);
    } catch {
      setGmailError("Failed to load Gmail status.");
    } finally { setGmailLoading(false); }
  };

  // Load profile on mount
  useEffect(() => {
    getUserProfile().then((data) => {
      setProfile(data as ProfileData);
      setName(data.name);
      if (data.brand) {
        setBrandName(data.brand.name);
        setIndustry(data.brand.industry);
        setTone(data.brand.toneOfVoice);
        setAudience(data.brand.targetAudience);
        setContext(data.brand.context);
        setBrandValues(data.brand.brandValues);
        setPainPoints(data.brand.painPoints);
      }
      setLoadingProfile(false);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGmailStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectGmail = () => {
    setGmailConnecting(true);
    window.location.href = "/api/gmail/auth";
  };

  const handleDisconnectGmail = async () => {
    setGmailDisconnecting(true);
    setGmailError(null);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "DELETE" });
      if (res.ok) setGmailStatus({ connected: false });
      else { const data = await res.json(); setGmailError(data.error || "Failed to disconnect Gmail."); }
    } catch { setGmailError("Disconnect failed. Please try again."); }
    finally { setGmailDisconnecting(false); }
  };

  // Handle Gmail callback params
  const gmailCallbackHandledRef = useRef(false);
  useEffect(() => {
    if (gmailCallbackHandledRef.current) return;
    gmailCallbackHandledRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const gmailResult = params.get("gmail");
    if (!gmailResult) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (gmailResult === "connected") fetchGmailStatus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (gmailResult === "denied") setGmailError("Gmail connection was denied. You can try again anytime.");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (gmailResult === "expired") setGmailError("The connection request expired. Please try again.");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (gmailResult === "error") setGmailError("An error occurred while connecting Gmail. Please try again.");
    window.history.replaceState({}, "", window.location.pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GDPR ──
  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mailmind-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch { toast.error("Failed to export data. Please try again."); }
    finally { setExporting(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Deletion failed"); }
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false); setShowDeleteConfirm(false);
    }
  };

  // ── Save handlers ──
  const handleSaveName = async () => {
    setSavingName(true); setNameSaved(false);
    const result = await updateProfileName(name);
    setSavingName(false);
    if (result.success) setNameSaved(true);
  };

  const handleSaveBrand = async () => {
    setSavingBrand(true); setBrandSaved(false);
    const result = await updateBrandProfile({
      name: brandName, industry, toneOfVoice: tone,
      targetAudience: audience, context, brandValues, painPoints,
    });
    setSavingBrand(false);
    if (result.success) setBrandSaved(true);
  };

  const toggleBrandValue = (val: string) => {
    setBrandValues((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const togglePainPoint = (pp: string) => {
    setPainPoints((prev) => prev.includes(pp) ? prev.filter((p) => p !== pp) : [...prev, pp]);
  };

  // ── Scroll to section when nav clicked ──
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace("section-", ""));
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    SETTINGS_NAV.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loadingProfile]);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 size={24} className="text-muted-foreground/50 animate-spin" />
      </div>
    );
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "profile":
        return (
          <SectionCard icon={<User size={15} />} title="Profile" subtitle="Your name, email, and avatar">
            <div className="space-y-5 max-w-lg">
              <div className="mb-6">
                <AvatarPicker />
              </div>
              {/* Email (read-only) */}
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 flex items-center gap-1.5">
                  <i className="ti ti-mail text-xs" aria-hidden="true" /> Email
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#F1EFE8] dark:bg-[#242422] rounded-lg border border-border/50 text-[#5F5E5A] dark:text-[#B4B2A9] text-sm">
                  {profile?.email}
                  {profile?.plan && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#EF9F27] font-medium">
                      <Crown size={11} /> {profile.plan}
                    </span>
                  )}
                </div>
              </div>
              {/* Name (editable) */}
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 flex items-center gap-1.5">
                  <i className="ti ti-user text-xs" aria-hidden="true" /> Display Name
                </label>
                <div className="flex items-center gap-3">
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameSaved(false); }}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder:text-[#888780]"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !name.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BA7517] transition-all"
                  >
                    {savingName ? <Loader2 size={13} className="animate-spin" /> : nameSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                    {nameSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        );

      case "brand":
        return (
          <SectionCard icon={<Building2 size={15} />} title="Brand Voice" subtitle="This helps the swarm write on-brand copy">
            <div className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 block">Company / Brand Name</label>
                  <input value={brandName} onChange={(e) => { setBrandName(e.target.value); setBrandSaved(false); }}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder:text-[#888780]"
                    placeholder="e.g. MailMind" />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 block">Industry</label>
                  <input value={industry} onChange={(e) => { setIndustry(e.target.value); setBrandSaved(false); }}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder:text-[#888780]"
                    placeholder="e.g. SaaS / Fintech / Agency" />
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-2 block">Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((toneOpt) => (
                    <PillButton key={toneOpt.value} selected={tone === toneOpt.value}
                      onClick={() => { setTone(toneOpt.value); setBrandSaved(false); }}>
                      {toneOpt.label}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 block">Target Audience</label>
                <textarea value={audience} onChange={(e) => { setAudience(e.target.value); setBrandSaved(false); }}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder:text-[#888780] resize-none"
                  placeholder="e.g. CTOs and Heads of Product at Series A startups" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-1.5 block">Additional Context</label>
                <textarea value={context} onChange={(e) => { setContext(e.target.value); setBrandSaved(false); }}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-sm outline-none focus:border-[#EF9F27]/50 transition-all placeholder:text-[#888780] resize-none"
                  placeholder="Any additional context about your business, unique value proposition, positioning..." />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-2 block">Brand Values</label>
                <div className="flex flex-wrap gap-2">
                  {BRAND_VALUES.map((val) => (
                    <PillButton key={val} selected={brandValues.includes(val)}
                      onClick={() => { toggleBrandValue(val); setBrandSaved(false); }}>
                      {val}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.4px] text-[#888780] uppercase font-medium mb-2 block">Pain Points</label>
                <div className="flex flex-wrap gap-2">
                  {PAIN_POINTS_PRESET.map((pp) => (
                    <PillButton key={pp} selected={painPoints.includes(pp)}
                      onClick={() => { togglePainPoint(pp); setBrandSaved(false); }}>
                      {pp}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handleSaveBrand} disabled={savingBrand || !brandName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BA7517] transition-all">
                  {savingBrand ? <Loader2 size={13} className="animate-spin" /> : brandSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                  {brandSaved ? "Brand Saved" : "Save Brand Profile"}
                </button>
                {brandSaved && <p className="text-[11px] text-[#1D9E75] dark:text-[#5DCAA5] mt-2 flex items-center gap-1"><CheckCircle2 size={11} /> Brand profile updated successfully.</p>}
              </div>
            </div>
          </SectionCard>
        );

      case "integrations":
        return (
          <SectionCard icon={<Mail size={15} />} title={t("settings.gmail_title")} subtitle={t("settings.gmail_subtitle")}>
            <div className="max-w-lg">
              {gmailLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={15} className="animate-spin text-[#888780]" />
                  <span className="text-sm text-[#888780]">Loading...</span>
                </div>
              ) : gmailStatus?.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#E1F5EE] dark:bg-[#04342C] rounded-xl border border-[#1D9E75]/20">
                    <CheckCircle2 size={18} className="text-[#1D9E75] dark:text-[#5DCAA5] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#085041] dark:text-[#9FE1CB]">Connected as</p>
                      <p className="text-sm text-[#085041]/80 dark:text-[#9FE1CB]/80 truncate">{gmailStatus.googleEmail}</p>
                      <p className="text-[11px] text-[#085041]/60 dark:text-[#9FE1CB]/60 mt-1">MailMind can send emails on your behalf.</p>
                    </div>
                    <button onClick={handleDisconnectGmail} disabled={gmailDisconnecting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-[#E24B4A]/30 text-[#E24B4A] text-xs font-medium hover:bg-[#FCEBEB] dark:hover:bg-[#501313] disabled:opacity-50 transition-all shrink-0">
                      {gmailDisconnecting ? <Loader2 size={11} className="animate-spin" /> : <Unplug size={11} />}
                      {gmailDisconnecting ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-[#F1EFE8] dark:bg-[#242422] rounded-xl border border-border/50">
                    <i className="ti ti-brand-google text-lg text-[#888780] mt-0.5" aria-hidden="true"></i>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">Connect your Gmail</p>
                      <p className="text-sm text-[#5F5E5A] dark:text-[#B4B2A9] mt-1">Allow MailMind to send emails and track replies on your behalf.</p>
                    </div>
                  </div>
                  <button onClick={handleConnectGmail}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF9F27] text-white text-xs font-medium hover:bg-[#BA7517] transition-all">
                    {gmailConnecting ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
                    {t("settings.gmail_connect")}
                  </button>
                </div>
              )}
              {gmailError && (
                <p className="text-[12px] text-[#E24B4A] dark:text-[#F09595] mt-3 flex items-center gap-1.5">
                  <AlertTriangle size={11} /> {gmailError}
                </p>
              )}
            </div>
          </SectionCard>
        );

      case "team":
        return (
          <SectionCard icon={<Users size={15} />} title="Team" subtitle="Manage your team members and their roles">
            <div className="max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#5F5E5A] dark:text-[#B4B2A9]">{t("settings.team_count") || "1 member"}</p>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium hover:bg-[#BA7517] transition-all">
                  <i className="ti ti-plus text-xs" aria-hidden="true"></i>
                  {t("settings.team_invite") || "Invite member"}
                </button>
              </div>
              <AnimatePresence mode={prefersReducedMotion ? "sync" : "popLayout"}>
                <div className="space-y-2">
                  <motion.div key="owner"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    layout={!prefersReducedMotion}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F1EFE8]/50 dark:bg-[#242422]/50 border border-border/50">
                    <div className="w-9 h-9 rounded-full bg-[#FAEEDA] dark:bg-[#2C1A00] flex items-center justify-center text-[#633806] dark:text-[#FAC775] text-xs font-bold">
                      {profile?.name?.charAt(0) || "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8] truncate">{profile?.name || "Founder"}</p>
                      <p className="text-xs text-[#888780] truncate">{profile?.email}</p>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider bg-[#FAEEDA] dark:bg-[#2C1A00] text-[#633806] dark:text-[#FAC775] px-2 py-0.5 rounded-full">
                      {t("settings.role_owner") || "Owner"}
                    </span>
                  </motion.div>
                </div>
              </AnimatePresence>
            </div>
          </SectionCard>
        );

      case "billing":
        return (
          <SectionCard icon={<CreditCard size={15} />} title="Billing & Plan" subtitle="Manage your subscription and billing">
            <div className="max-w-lg space-y-5">
              <div className="flex items-center justify-between p-4 bg-[#F1EFE8] dark:bg-[#242422] rounded-xl border border-border/50">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">{t("settings.current_plan") || "Current Plan"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile?.plan === "PROFESSIONAL" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#633806] dark:text-[#FAC775] bg-[#FAEEDA] dark:bg-[#2C1A00] px-2.5 py-0.5 rounded-full">
                        <Crown size={10} /> PROFESSIONAL
                      </span>
                    ) : profile?.plan === "STARTER" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        STARTER
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        FREE
                      </span>
                    )}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium hover:bg-[#BA7517] transition-all">
                  {t("settings.manage_billing") || "Manage billing"} <ArrowRight size={11} />
                </button>
              </div>
              <div className="p-4 bg-[#FAEEDA] dark:bg-[#2C1A00] border-2 border-[#EF9F27] rounded-xl">
                <p className="text-sm font-medium text-[#633806] dark:text-[#FAC775]">{t("settings.trial_active") || "Your trial ends in 14 days"}</p>
                <p className="text-xs text-[#633806]/70 dark:text-[#FAC775]/70 mt-1">{t("settings.trial_desc") || "Upgrade now to keep all your data and campaigns."}</p>
                <button className="mt-3 px-4 py-1.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium hover:bg-[#BA7517] transition-all">{t("settings.upgrade") || "Upgrade now"}</button>
              </div>
            </div>
          </SectionCard>
        );

      case "notifications":
        return (
          <SectionCard icon={<Bell size={15} />} title="Notifications" subtitle="Control what you get notified about">
            <div className="max-w-lg space-y-4">
              {[
                { key: "replies", label: t("settings.notif_replies") || "Campaign reply received" },
                { key: "swarm", label: t("settings.notif_swarm") || "Swarm completed" },
                { key: "trial", label: t("settings.notif_trial") || "Trial expiring" },
                { key: "digest", label: t("settings.notif_digest") || "Weekly digest" },
              ].map((notif) => (
                <div key={notif.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#1C1C1A] dark:text-[#F1EFE8]">{notif.label}</span>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [notif.key]: !prev[notif.key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                      notifications[notif.key] ? "bg-[#EF9F27]" : "bg-[#F1EFE8] dark:bg-[#242422]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        notifications[notif.key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        );

      case "api-keys":
        return (
          <SectionCard icon={<Key size={15} />} title="API Keys" subtitle="Manage access tokens for the MailMind API">
            <div className="max-w-lg space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F1EFE8] dark:bg-[#242422] rounded-xl border border-border/50">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">{t("settings.api_keys_create") || "Create new key"}</p>
                  <p className="text-xs text-[#888780] mt-0.5">{t("settings.api_keys_desc") || "Generate an API key for programmatic access."}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EF9F27] text-white text-xs font-medium hover:bg-[#BA7517] transition-all shrink-0">
                  <Plus size={12} /> {t("settings.api_keys_generate") || "Generate"}
                </button>
              </div>
              <p className="text-xs text-[#888780]"><Key size={11} className="inline mr-1" /> {t("settings.api_keys_usage") || "Use your API key to interact with MailMind via REST API."}</p>
            </div>
          </SectionCard>
        );

      case "privacy":
        return (
          <SectionCard icon={<Shield size={15} />} title="Privacy & Data" subtitle="Manage your data and account — GDPR compliant">
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between p-4 bg-[#F1EFE8] dark:bg-[#242422] rounded-xl border border-border/50">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">Export your data</p>
                  <p className="text-xs text-[#888780] mt-0.5">Download all your data as a JSON file.</p>
                </div>
                <button onClick={handleExportData} disabled={exporting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-xs font-medium hover:bg-[#F1EFE8] dark:hover:bg-[#242422] disabled:opacity-50 transition-all shrink-0">
                  {exporting ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                  {exporting ? "Exporting..." : "Export Data"}
                </button>
              </div>
              <div className="p-4 bg-[#FCEBEB] dark:bg-[#501313] rounded-xl border border-[#E24B4A]/30">
                <p className="text-sm font-medium text-[#791F1F] dark:text-[#F7C1C1]">Delete your account</p>
                <p className="text-xs text-[#791F1F]/70 dark:text-[#F7C1C1]/70 mt-0.5">This permanently deletes your account and all associated data. This cannot be undone.</p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-[#E24B4A] text-white text-xs font-medium hover:bg-[#C33D3C] transition-all">
                    <Trash2 size={11} /> Delete My Account
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-[#791F1F] dark:text-[#F7C1C1]">Are you sure? This action is permanent.</p>
                    <div className="flex gap-2">
                      <button onClick={handleDeleteAccount} disabled={deleting}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E24B4A] text-white text-xs font-medium hover:bg-[#C33D3C] disabled:opacity-50 transition-all">
                        {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                        {deleting ? "Deleting..." : "Yes, Delete Everything"}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                        className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1A] border border-border/50 text-[#1C1C1A] dark:text-[#F1EFE8] text-xs font-medium hover:bg-[#F1EFE8] dark:hover:bg-[#242422] disabled:opacity-50 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 xl:px-6 py-4 xl:py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg xl:text-xl font-medium text-[#1C1C1A] dark:text-[#F1EFE8]">Settings</h1>
        <p className="text-xs xl:text-sm text-[#5F5E5A] dark:text-[#B4B2A9] mt-0.5">
          Manage your profile, brand identity, and preferences.
        </p>
      </div>

      {/* Mobile section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5 md:hidden custom-scrollbar">
        {SETTINGS_NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all",
              activeSection === item.id
                ? "bg-[#FAEEDA] dark:bg-[#2C1A00] text-[#BA7517] dark:text-[#FAC775] font-medium"
                : "text-[#5F5E5A] dark:text-[#B4B2A9] hover:bg-[#F1EFE8] dark:hover:bg-[#242422]",
            )}
          >
            <i className={cn(item.icon, "text-xs")} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop: sidebar nav + content */}
      <div className="flex gap-6 xl:gap-8">
        <SettingsNav active={activeSection} onSelect={scrollToSection} />
        <div className="flex-1 min-w-0 space-y-5">
          {SETTINGS_NAV.map(({ id }) => (
            <div key={id} id={`section-${id}`}>
              {renderSection(id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
