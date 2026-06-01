"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Target,
  Mic,
  FileText,
  Hash,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  Mail,
  Crown,
  Unplug,
  ExternalLink,
  Download,
  Trash2,
  Shield,
} from "lucide-react";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { getUserProfile, updateProfileName, updateBrandProfile, type BrandProfile } from "@/app/actions/profile";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/I18nProvider";
import { toast } from "sonner";

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

type GmailStatus = {
  connected: boolean;
  googleEmail?: string;
};

type ProfileData = {
  name: string;
  email: string;
  plan: string;
  brand: BrandProfile | null;
};

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-xl border border-border shadow-sm overflow-hidden", className)}
    >
      <div className="px-8 pt-7 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center text-copper">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-8 py-6">{children}</div>
    </motion.div>
  );
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[11px] px-3.5 py-1.5 rounded-full border transition-all",
        selected
          ? "border-copper text-copper bg-copper/10 shadow-sm"
          : "border-border text-muted-foreground hover:text-foreground/80 hover:border-gray-300",
      )}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
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

  // GDPR state
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Fetch Gmail connection status
    fetchGmailStatus();
  }, []);

  // ── Gmail connection status ──
  const fetchGmailStatus = async () => {
    setGmailLoading(true);
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      setGmailStatus(data as GmailStatus);
      setGmailError(null);
    } catch {
      setGmailError("Failed to load Gmail status.");
    } finally {
      setGmailLoading(false);
    }
  };

  // ── Connect Gmail ──
  const handleConnectGmail = () => {
    setGmailConnecting(true);
    // Direct browser redirect — the API route returns a 307 redirect to Google.
    // The browser handles the redirect chain natively, and errors are caught
    // by the callback param handler in useEffect.
    window.location.href = "/api/gmail/auth";
  };

  // ── Disconnect Gmail ──
  const handleDisconnectGmail = async () => {
    setGmailDisconnecting(true);
    setGmailError(null);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "DELETE" });
      if (res.ok) {
        setGmailStatus({ connected: false });
      } else {
        const data = await res.json();
        setGmailError(data.error || "Failed to disconnect Gmail.");
      }
    } catch {
      setGmailError("Disconnect failed. Please try again.");
    } finally {
      setGmailDisconnecting(false);
    }
  };

  // Handle Gmail callback params on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmailResult = params.get("gmail");
    if (!gmailResult) return;

    if (gmailResult === "connected") {
      fetchGmailStatus();
    } else if (gmailResult === "denied") {
      setGmailError("Gmail connection was denied. You can try again anytime.");
    } else if (gmailResult === "expired") {
      setGmailError("The connection request expired. Please try again.");
    } else if (gmailResult === "error") {
      setGmailError("An error occurred while connecting Gmail. Please try again.");
    }

    // Clean the URL
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // ── GDPR: Export data ──
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
    } catch {
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ── GDPR: Delete account ──
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deletion failed");
      }
      // Redirect to home after deletion
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Save name ──
  const handleSaveName = async () => {
    setSavingName(true);
    setNameSaved(false);
    const result = await updateProfileName(name);
    setSavingName(false);
    if (result.success) setNameSaved(true);
  };

  // ── Save brand ──
  const handleSaveBrand = async () => {
    setSavingBrand(true);
    setBrandSaved(false);
    const result = await updateBrandProfile({
      name: brandName,
      industry,
      toneOfVoice: tone,
      targetAudience: audience,
      context,
      brandValues,
      painPoints,
    });
    setSavingBrand(false);
    if (result.success) setBrandSaved(true);
  };

  // Toggle brand values
  const toggleBrandValue = (val: string) => {
    setBrandValues((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  // Toggle pain points
  const togglePainPoint = (pp: string) => {
    setPainPoints((prev) =>
      prev.includes(pp) ? prev.filter((p) => p !== pp) : [...prev, pp],
    );
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 size={24} className="text-muted-foreground/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-2 font-mono">
          {"// Account"}
        </div>
        <h1 className="font-display text-[40px] leading-[1.05] text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2 text-[14px]">
          Manage your profile, brand identity, and preferences.
        </p>
      </motion.div>

      <div className="copper-streak" />

      {/* ── SECTION 1: Avatar ── */}
      <SectionCard
        icon={<User size={18} />}
        title="Avatar"
        subtitle="Choose how you appear to the swarm"
      >
        <AvatarPicker />
      </SectionCard>

      {/* ── SECTION 2: Profile Info ── */}
      <SectionCard
        icon={<User size={18} />}
        title="Profile"
        subtitle="Your name and email"
      >
        <div className="space-y-5 max-w-lg">
          {/* Email (read-only) */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">
              <div className="flex items-center gap-1.5">
                <Mail size={12} /> Email
              </div>
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl border border-border text-muted-foreground text-sm">
              {profile?.email}
              {profile?.plan && (
                <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-copper font-bold">
                  <Crown size={12} /> {profile.plan}
                </span>
              )}
            </div>
          </div>

          {/* Name (editable) */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">
              <div className="flex items-center gap-1.5">
                <User size={12} /> Display Name
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSaved(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-all placeholder:text-muted-foreground"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || !name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-copper/80 transition-all"
              >
                {savingName ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : nameSaved ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Save size={14} />
                )}
                {nameSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 3: Brand Info ── */}
      <SectionCard
        icon={<Building2 size={18} />}
        title="Brand Identity"
        subtitle="This information helps the swarm understand your business and write on-brand copy"
      >
        <div className="space-y-6 max-w-2xl">
          {/* Brand name */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Building2 size={12} /> Company / Brand Name
            </label>
            <input
              value={brandName}
              onChange={(e) => { setBrandName(e.target.value); setBrandSaved(false); }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-all placeholder:text-muted-foreground"
              placeholder="e.g. MailMind"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Hash size={12} /> Industry
            </label>
            <input
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setBrandSaved(false); }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-all placeholder:text-muted-foreground"
              placeholder="e.g. SaaS / Fintech / Agency"
            />
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-2 flex items-center gap-1.5">
              <Mic size={12} /> Tone of Voice
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <PillButton
                  key={t.value}
                  selected={tone === t.value}
                  onClick={() => { setTone(t.value); setBrandSaved(false); }}
                >
                  {t.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Target size={12} /> Target Audience
            </label>
            <textarea
              value={audience}
              onChange={(e) => { setAudience(e.target.value); setBrandSaved(false); }}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-all placeholder:text-muted-foreground resize-none"
              placeholder="e.g. CTOs and Heads of Product at Series A startups"
            />
          </div>

          {/* Context */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Additional Context
            </label>
            <textarea
              value={context}
              onChange={(e) => { setContext(e.target.value); setBrandSaved(false); }}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-all placeholder:text-muted-foreground resize-none"
              placeholder="Any additional context about your business, unique value proposition, positioning..."
            />
          </div>

          {/* Brand Values */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-2 flex items-center gap-1.5">
              <Heart size={12} /> Brand Values
            </label>
            <div className="flex flex-wrap gap-2">
              {BRAND_VALUES.map((val) => (
                <PillButton
                  key={val}
                  selected={brandValues.includes(val)}
                  onClick={() => { toggleBrandValue(val); setBrandSaved(false); }}
                >
                  {val}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Pain Points */}
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Pain Points
            </label>
            <div className="flex flex-wrap gap-2">
              {PAIN_POINTS_PRESET.map((pp) => (
                <PillButton
                  key={pp}
                  selected={painPoints.includes(pp)}
                  onClick={() => { togglePainPoint(pp); setBrandSaved(false); }}
                >
                  {pp}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              onClick={handleSaveBrand}
              disabled={savingBrand || !brandName.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-copper text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-copper/80 transition-all"
            >
              {savingBrand ? (
                <Loader2 size={14} className="animate-spin" />
              ) : brandSaved ? (
                <CheckCircle2 size={14} />
              ) : (
                <Save size={14} />
              )}
              {brandSaved ? "Brand Saved" : "Save Brand Profile"}
            </button>
            {brandSaved && (
              <p className="text-[11px] text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Brand profile updated successfully.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION 4: Gmail Integration ── */}
      <SectionCard
        icon={<Mail size={18} />}
        title={t("settings.gmail_title")}
        subtitle={t("settings.gmail_subtitle")}
      >
        <div className="max-w-lg">
          {gmailLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
            </div>
          ) : gmailStatus?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">
                    {t("settings.gmail_connected_as")}
                  </p>
                  <p className="text-sm text-emerald-700 truncate">
                    {gmailStatus.googleEmail}
                  </p>
                  <p className="text-[11px] text-emerald-600/70 mt-1">
                    {t("settings.gmail_connected_desc")}
                  </p>
                </div>
                <button
                  onClick={handleDisconnectGmail}
                  disabled={gmailDisconnecting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-all flex-shrink-0"
                >
                  {gmailDisconnecting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Unplug size={12} />
                  )}
                  {gmailDisconnecting ? t("settings.gmail_disconnecting") : t("settings.gmail_disconnect")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-xl border border-border">
                <Mail size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t("settings.gmail_not_connected")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.gmail_not_connected_desc")}
                  </p>
                </div>
              </div>                <button
                  onClick={handleConnectGmail}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-bold hover:bg-copper/80 transition-all"
                >
                {gmailConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                {t("settings.gmail_connect")}
              </button>
            </div>
          )}

          {gmailError && (
            <p className="text-[12px] text-red-600 mt-3 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              {gmailError}
            </p>
          )}
        </div>
      </SectionCard>
      {/* ── SECTION 5: Privacy & Data ── */}
      <SectionCard
        icon={<Shield size={18} />}
        title="Privacy & Data"
        subtitle="Manage your data and account — GDPR compliant"
      >
        <div className="space-y-5 max-w-lg">
          {/* Export data */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Export your data</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Download all your data as a JSON file (profile, campaigns, prospects, email events).
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-all flex-shrink-0"
            >
              {exporting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              {exporting ? "Exporting..." : "Export Data"}
            </button>
          </div>

          {/* Delete account */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm font-semibold text-red-800">Delete your account</p>
            <p className="text-[12px] text-red-700 mt-0.5">
              This permanently deletes your account and all associated data — projects, vault documents, swarm executions, email events, and prospects. This cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
              >
                <Trash2 size={12} />
                Delete My Account
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[12px] font-bold text-red-900">
                  Are you sure? This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                  >
                    {deleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    {deleting ? "Deleting..." : "Yes, Delete Everything"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-white border border-border text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
