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
} from "lucide-react";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { getUserProfile, updateProfileName, updateBrandProfile, type BrandProfile } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

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
  "Low response rates", "Generic outreach feels spammy",
  "Too many tools, no workflow", "Can't scale personalization",
  "Hard to track prospect research", "Team collaboration is messy",
  "No data-driven copy decisions", "Templates feel robotic",
];

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
      className={cn("bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden", className)}
    >
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff5f5f]/10 flex items-center justify-center text-[#ff5f5f]">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
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
          ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10 shadow-sm"
          : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300",
      )}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
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

  // Load profile on mount
  useEffect(() => {
    getUserProfile().then((data) => {
      setProfile(data as unknown as ProfileData);
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
  }, []);

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
        <Loader2 size={24} className="text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-2 font-mono">
          {"// Account"}
        </div>
        <h1 className="font-display text-[40px] leading-[1.05] text-gray-900">Settings</h1>
        <p className="text-gray-400 mt-2 text-[14px]">
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
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 block">
              <div className="flex items-center gap-1.5">
                <Mail size={12} /> Email
              </div>
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm">
              {profile?.email}
              {profile?.plan && (
                <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#ff5f5f] font-bold">
                  <Crown size={12} /> {profile.plan}
                </span>
              )}
            </div>
          </div>

          {/* Name (editable) */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 block">
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#ff5f5f]/50 transition-all placeholder:text-gray-400"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || !name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5f5f] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-all"
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
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Building2 size={12} /> Company / Brand Name
            </label>
            <input
              value={brandName}
              onChange={(e) => { setBrandName(e.target.value); setBrandSaved(false); }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#ff5f5f]/50 transition-all placeholder:text-gray-400"
              placeholder="e.g. MailMind"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Hash size={12} /> Industry
            </label>
            <input
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setBrandSaved(false); }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#ff5f5f]/50 transition-all placeholder:text-gray-400"
              placeholder="e.g. SaaS / Fintech / Agency"
            />
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
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
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <Target size={12} /> Target Audience
            </label>
            <textarea
              value={audience}
              onChange={(e) => { setAudience(e.target.value); setBrandSaved(false); }}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#ff5f5f]/50 transition-all placeholder:text-gray-400 resize-none"
              placeholder="e.g. CTOs and Heads of Product at Series A startups"
            />
          </div>

          {/* Context */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Additional Context
            </label>
            <textarea
              value={context}
              onChange={(e) => { setContext(e.target.value); setBrandSaved(false); }}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#ff5f5f]/50 transition-all placeholder:text-gray-400 resize-none"
              placeholder="Any additional context about your business, unique value proposition, positioning..."
            />
          </div>

          {/* Brand Values */}
          <div>
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
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
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff5f5f] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-all"
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
    </div>
  );
}
