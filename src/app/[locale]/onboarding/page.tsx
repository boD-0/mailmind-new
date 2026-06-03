"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/I18nProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { submitOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth/auth-client";
import {
  ArrowRight, Check, Building2, Users, PenLine, HeartHandshake,
  TrendingUpDown, Sparkles, Brain, Zap, Database,
  Layout, Bot, Crown,
} from "lucide-react";
import { RagOnboarding } from "@/components/rag/RagOnboarding";

// ─── VARIANTS ─────────────────────────────────────────────────────────────────

const slideUp = {
  enter: { y: 60, opacity: 0, scale: 0.97 },
  center: { y: 0, opacity: 1, scale: 1 },
  exit: { y: -40, opacity: 0, scale: 0.97 },
};

// ─── AURELIUS SPEECH BUBBLE ──────────────────────────────────────────────────

function AureliusBubble({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex items-start gap-3 mb-6"
    >
      <div className="w-10 h-10 rounded-xl bg-copper flex items-center justify-center shrink-0 shadow-sm">
        <Sparkles size={18} className="text-white" />
      </div>
      <div className="bg-card rounded-2xl rounded-tl-none p-4 border border-border shadow-sm max-w-[85%]">
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </motion.div>
  );
}

// ─── TOOL SHOWCASE CARD ──────────────────────────────────────────────────────

function ToolCard({
  tool,
  index,
  isExpanded,
  onToggle,
  t,
}: {
  tool: {
    id: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    bgColor: string;
    iconColor: string;
    title: string;
    description: string;
    features: string[];
  };
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${            isExpanded
              ? "border-copper/30 shadow-sm"
          : "border-border hover:border-copper/20 hover:shadow-md"
      }`}
      onClick={() => onToggle(tool.id)}
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center ${tool.iconColor}`}>
            <tool.icon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground">{tool.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isExpanded ? t('onboarding.click_collapse') : t('onboarding.click_expand')}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronIcon />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tool.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.color}`} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-8">
      <motion.div
        className="h-full bg-copper rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;
        return (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              isComplete
                ? 'bg-copper'
                : isCurrent
                ? 'border-2 border-copper bg-transparent'
                : 'bg-muted'
            }`}
          />
        );
      })}
    </div>
  );
}
// ─── BRAND VALUES (translatable) ─────────────────────────────────────────────

function getBrandValues(t: (key: string) => string): string[] {
  // Keys in messages (e.g. en.json has brand_values array)
  // Fallback to English array if not available
  try {
    // We use individual t() calls per value
    return [
      t('brand_values.0') !== 'brand_values.0' ? t('brand_values.0') : "Innovation",
      t('brand_values.1') !== 'brand_values.1' ? t('brand_values.1') : "Exclusivity",
      t('brand_values.2') !== 'brand_values.2' ? t('brand_values.2') : "Integrity",
      t('brand_values.3') !== 'brand_values.3' ? t('brand_values.3') : "Efficiency",
      t('brand_values.4') !== 'brand_values.4' ? t('brand_values.4') : "Empathy",
      t('brand_values.5') !== 'brand_values.5' ? t('brand_values.5') : "Transparency",
      t('brand_values.6') !== 'brand_values.6' ? t('brand_values.6') : "Sustainability",
      t('brand_values.7') !== 'brand_values.7' ? t('brand_values.7') : "Quality",
      t('brand_values.8') !== 'brand_values.8' ? t('brand_values.8') : "Authenticity",
      t('brand_values.9') !== 'brand_values.9' ? t('brand_values.9') : "Courage",
      t('brand_values.10') !== 'brand_values.10' ? t('brand_values.10') : "Precision",
      t('brand_values.11') !== 'brand_values.11' ? t('brand_values.11') : "Refinement",
    ];
  } catch {
    return ["Innovation", "Exclusivity", "Integrity", "Efficiency", "Empathy", "Transparency", "Sustainability", "Quality", "Authenticity", "Courage", "Precision", "Refinement"];
  }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { data: session, isPending } = authClient.useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [activeTools, setActiveTools] = useState<string[]>([]);

  // ── Data (translated) ──

  const BRAND_VALUES = getBrandValues(t);

  const PAIN_POINTS_OPTIONS = [
    { id: "low-response", label: t('pain_labels.low-response'), icon: "📉" },
    { id: "poor-personalization", label: t('pain_labels.poor-personalization'), icon: "🤖" },
    { id: "time-research", label: t('pain_labels.time-research'), icon: "⏰" },
    { id: "inconsistent-voice", label: t('pain_labels.inconsistent-voice'), icon: "🎭" },
    { id: "hard-to-scale", label: t('pain_labels.hard-to-scale'), icon: "📈" },
    { id: "no-tracking", label: t('pain_labels.no-tracking'), icon: "📊" },
    { id: "low-conversion", label: t('pain_labels.low-conversion'), icon: "🎯" },
    { id: "wrong-audience", label: t('pain_labels.wrong-audience'), icon: "🎪" },
  ];

  const TONE_OPTIONS = [
    t('tone_options.0') !== 'tone_options.0' ? t('tone_options.0') : "Direct",
    t('tone_options.1') !== 'tone_options.1' ? t('tone_options.1') : "Professional",
    t('tone_options.2') !== 'tone_options.2' ? t('tone_options.2') : "Friendly",
    t('tone_options.3') !== 'tone_options.3' ? t('tone_options.3') : "Academic",
    t('tone_options.4') !== 'tone_options.4' ? t('tone_options.4') : "Inspirational",
    t('tone_options.5') !== 'tone_options.5' ? t('tone_options.5') : "Authoritative",
    t('tone_options.6') !== 'tone_options.6' ? t('tone_options.6') : "Empathetic",
    t('tone_options.7') !== 'tone_options.7' ? t('tone_options.7') : "Playful",
  ];

  const TOOLS = [
    {
      id: "swarm",
      icon: Bot,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      title: t('tool_titles.swarm'),
      description: t('tool_descriptions.swarm'),
      features: [
        t('tool_features.swarm.0'),
        t('tool_features.swarm.1'),
        t('tool_features.swarm.2'),
        t('tool_features.swarm.3'),
      ],
    },
    {
      id: "digital-twin",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      title: t('tool_titles.digital-twin'),
      description: t('tool_descriptions.digital-twin'),
      features: [
        t('tool_features.digital-twin.0'),
        t('tool_features.digital-twin.1'),
        t('tool_features.digital-twin.2'),
        t('tool_features.digital-twin.3'),
      ],
    },
    {
      id: "vault",
      icon: Database,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: t('tool_titles.vault'),
      description: t('tool_descriptions.vault'),
      features: [
        t('tool_features.vault.0'),
        t('tool_features.vault.1'),
        t('tool_features.vault.2'),
        t('tool_features.vault.3'),
      ],
    },
    {
      id: "war-room",
      icon: Layout,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      title: t('tool_titles.war-room'),
      description: t('tool_descriptions.war-room'),
      features: [
        t('tool_features.war-room.0'),
        t('tool_features.war-room.1'),
        t('tool_features.war-room.2'),
        t('tool_features.war-room.3'),
      ],
    },
  ];

  const STEPS = [
    { id: "welcome", label: t('onboarding.step_welcome'), icon: Sparkles },
    { id: "brand", label: t('onboarding.step_brand'), icon: Building2 },
    { id: "audience", label: t('onboarding.step_audience'), icon: Users },
    { id: "voice", label: t('onboarding.step_voice'), icon: PenLine },
    { id: "values", label: t('onboarding.step_values'), icon: HeartHandshake },
    { id: "pain-points", label: t('onboarding.step_pain_points'), icon: TrendingUpDown },
    { id: "tools", label: t('onboarding.step_tools'), icon: Zap },
    { id: "documents", label: t('onboarding.step_documents'), icon: Database },
    { id: "subscription", label: t('onboarding.step_subscription'), icon: Crown },
    { id: "final", label: t('onboarding.step_final'), icon: Sparkles },
  ];

  const allToolsOpen = activeTools.length === TOOLS.length;
  const toggleTool = (id: string) => {
    setActiveTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    toneOfVoice: "",
    targetAudience: "",
    context: "",
  });

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [customPainPoint, setCustomPainPoint] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "STARTER" | "PROFESSIONAL">("FREE");

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/${locale}/sign-up`);
    }
  }, [session, isPending, router, locale]);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ── Navigation ──

  const goNext = () => {
    if (step === 1 && (!formData.name || !formData.industry)) {
      toast.error(t('onboarding.toast_name_industry'));
      return;
    }
    if (step === 2 && !formData.targetAudience) {
      toast.error(t('onboarding.toast_audience'));
      return;
    }
    if (step === 3 && !formData.toneOfVoice) {
      toast.error(t('onboarding.toast_voice'));
      return;
    }
    if (step === 4 && selectedValues.length === 0) {
      toast.error(t('onboarding.toast_values'));
      return;
    }
    if (step === 8) {
      // Subscription step - ensure a plan is selected (default is FREE, so always valid)
      // User must explicitly choose, but we have a default
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const togglePainPoint = (id: string) => {
    setSelectedPainPoints((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addCustomPainPoint = () => {
    const trimmed = customPainPoint.trim();
    if (trimmed && !selectedPainPoints.includes(trimmed)) {
      setSelectedPainPoints((prev) => [...prev, trimmed]);
      setCustomPainPoint("");
    }
  };

  // ── Submit ──

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitOnboarding({
        ...formData,
        brandValues: selectedValues,
        painPoints: selectedPainPoints,
        selectedPlan,
      });

      if (res.success) {
        posthog.capture("onboarding_completed", {
          industry: formData.industry,
          tone_of_voice: formData.toneOfVoice,
          brand_values_count: selectedValues.length,
          pain_points_count: selectedPainPoints.length,
          selected_plan: selectedPlan,
        });
        toast.success(t('onboarding.toast_success'));
        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(res.error || t('onboarding.toast_error'));
      }
    } catch {
      toast.error(t('onboarding.toast_connection'));
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-copper animate-pulse font-display text-xl">{t('onboarding.loading')}</div>
      </div>
    );
  }

  const AURELIUS_PANEL_MESSAGES = [
    t('onboarding.aurelius_welcome_2'),
    t('onboarding.aurelius_brand'),
    t('onboarding.aurelius_audience'),
    t('onboarding.aurelius_voice'),
    t('onboarding.aurelius_values'),
    t('onboarding.aurelius_pain'),
    t('onboarding.aurelius_tools_1'),
    t('onboarding.aurelius_documents'),
    t('onboarding.aurelius_subscription'),
    t('onboarding.aurelius_final_1'),
  ];

  const stepLabel = `Step ${step + 1} of ${STEPS.length}`;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-copper/5 to-transparent blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm font-semibold tracking-tight">MailMind</div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <div className="text-sm font-medium text-foreground/80">{stepLabel}</div>
              <StepIndicator current={step} total={STEPS.length} />
            </div>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
            <aside className="hidden rounded-[28px] border border-amber-200/70 bg-amber-50 p-6 shadow-sm lg:block">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-base font-semibold">Au</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Aurelius</p>
                  <p className="text-xs text-muted-foreground">Your agency strategist</p>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                <p className="text-sm leading-7 text-foreground">{AURELIUS_PANEL_MESSAGES[step]}</p>
                <div className="rounded-3xl border border-amber-200 bg-white/80 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700 font-semibold">Aurelius says</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    I help you shape the right campaign from the start and keep your voice consistent.
                  </p>
                </div>
              </div>
            </aside>

            <main className="rounded-[28px] border border-border bg-card shadow-xl overflow-hidden">
              {step > 0 && <ProgressBar current={step} total={STEPS.length} />}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={slideUp}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="p-8 md:p-10"
                  ref={contentRef}
                >
              {/* ──────── STEP 0: WELCOME ──────── */}
              {step === 0 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_welcome_1')} delay={0} />
                  <AureliusBubble text={t('onboarding.aurelius_welcome_2')} delay={0.3} />
                  <AureliusBubble text={t('onboarding.aurelius_welcome_3')} delay={0.6} />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      type="button"
                      onClick={goNext}
                      className="bg-copper hover:opacity-90 text-white h-12 px-10 rounded-xl shadow-lg shadow-copper/20 text-sm font-bold tracking-wide"
                    >
                      {t('onboarding.start_button')}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 1: Brand ──────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_brand')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <div className="space-y-2">
                      <label className="text-foreground/80 text-xs uppercase tracking-widest font-bold">{t('onboarding.brand_label')}</label>
                      <Input
                        placeholder={t('onboarding.brand_placeholder')}
                        className="bg-muted border-border focus:border-copper h-12"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-foreground/80 text-xs uppercase tracking-widest font-bold">{t('onboarding.industry_label')}</label>
                      <Input
                        placeholder={t('onboarding.industry_placeholder')}
                        className="bg-muted border-border focus:border-copper h-12"
                        value={formData.industry}
                        onChange={(e) => setFormData((p) => ({ ...p, industry: e.target.value }))}
                      />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 2: Target Audience ──────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_audience')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-foreground/80 text-xs uppercase tracking-widest font-bold">{t('onboarding.audience_label')}</label>
                    <Input
                      placeholder={t('onboarding.audience_placeholder')}
                      className="bg-muted border-border focus:border-copper h-12"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
                    />
                    <p className="text-muted-foreground text-xs mt-1 italic">
                      {t('onboarding.audience_hint')}
                    </p>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 3: Tone of Voice ──────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_voice')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-foreground/80 text-xs uppercase tracking-widest font-bold">{t('onboarding.voice_label')}</label>
                    <Input
                      placeholder={t('onboarding.voice_placeholder')}
                      className="bg-muted border-border focus:border-copper h-12"
                      value={formData.toneOfVoice}
                      onChange={(e) => setFormData((p) => ({ ...p, toneOfVoice: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {TONE_OPTIONS.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, toneOfVoice: tone }))}
                          className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                            formData.toneOfVoice === tone
                              ? "border-copper bg-copper/5 text-copper font-semibold"
                              : "border-border text-muted-foreground hover:border-gray-300"
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 4: Brand Values ──────── */}
              {step === 4 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_values')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex flex-wrap gap-2.5 justify-center"
                  >
                    {BRAND_VALUES.map((value) => (
                      <Badge
                        key={value}
                        variant={selectedValues.includes(value) ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-sm px-4 py-2 rounded-full ${
                          selectedValues.includes(value)
                            ? "bg-copper text-white border-copper shadow-sm"
                            : "bg-transparent border-border text-muted-foreground hover:border-copper hover:text-copper"
                        }`}
                        onClick={() => toggleValue(value)}
                      >
                        {value}
                        {selectedValues.includes(value) && <Check size={12} className="ml-1.5" />}
                      </Badge>
                    ))}
                  </motion.div>
                  {selectedValues.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                      {t('onboarding.values_count', { count: selectedValues.length })}
                    </p>
                  )}
                </div>
              )}

              {/* ──────── STEP 5: Pain Points ──────── */}
              {step === 5 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_pain')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {PAIN_POINTS_OPTIONS.map((pp) => (
                      <button
                        key={pp.id}
                        type="button"
                        onClick={() => togglePainPoint(pp.id)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                          selectedPainPoints.includes(pp.id)
                            ? "border-copper bg-copper/5 text-copper"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-gray-300"
                        }`}
                      >
                        <span className="text-lg">{pp.icon}</span>
                        <span className="text-sm font-medium flex-1">{pp.label}</span>
                        {selectedPainPoints.includes(pp.id) && (
                          <Check size={14} className="shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('onboarding.pain_placeholder')}
                      className="bg-muted border-border focus:border-copper h-11"
                      value={customPainPoint}
                      onChange={(e) => setCustomPainPoint(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomPainPoint();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomPainPoint}
                      className="shrink-0 border-border text-muted-foreground"
                    >
                      {t('onboarding.pain_add')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ──────── STEP 6: TOOL SHOWCASE ──────── */}
              {step === 6 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_tools_1')} delay={0} />
                  <AureliusBubble text={t('onboarding.aurelius_tools_2')} delay={0.3} />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex items-center justify-center pt-1 pb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTools(
                            allToolsOpen ? [] : TOOLS.map((t) => t.id)
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-copper transition-colors"
                      >
                        <Layout size={12} />
                        {allToolsOpen ? t('onboarding.collapse_all') : t('onboarding.expand_all')}
                      </button>
                    </div>

                    {TOOLS.map((tool, i) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        index={i}
                        isExpanded={activeTools.includes(tool.id)}
                        onToggle={toggleTool}
                        t={t}
                      />
                    ))}
                  </motion.div>

                  {activeTools.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-muted-foreground italic"
                    >
                      {t('onboarding.click_to_minimize')}
                    </motion.p>
                  )}
                </div>
              )}

              {/* ──────── STEP 7: RAG DOCUMENTS ──────── */}
              {step === 7 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_documents')} delay={0} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <RagOnboarding
                      onComplete={() => goNext()}
                      onSkip={() => goNext()}
                    />
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 8: SUBSCRIPTION ──────── */}
              {step === 8 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_subscription')} delay={0} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {/* FREE PLAN */}
                    <motion.button
                      onClick={() => setSelectedPlan("FREE")}
                      whileHover={{ y: -4 }}
                      className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                        selectedPlan === "FREE"
                          ? "border-copper/50 bg-copper/5 shadow-lg shadow-copper/10"
                          : "border-border hover:border-copper/30"
                      }`}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">FREE</h3>
                          <p className="text-sm text-muted-foreground mt-1">{t('onboarding.plan_free_desc')}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-copper" />
                            <span className="text-foreground">1 agent per swarm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-copper" />
                            <span className="text-foreground">3 swarms/month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-copper" />
                            <span className="text-foreground">GPT-4o Mini</span>
                          </div>
                        </div>
                        {selectedPlan === "FREE" && (
                          <div className="absolute top-2 right-2 bg-copper text-white text-xs px-2 py-1 rounded-full font-bold">
                            {t('onboarding.selected')}
                          </div>
                        )}
                      </div>
                    </motion.button>

                    {/* STARTER PLAN */}
                    <motion.button
                      onClick={() => setSelectedPlan("STARTER")}
                      whileHover={{ y: -4 }}
                      className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                        selectedPlan === "STARTER"
                          ? "border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                          : "border-border hover:border-blue-500/30"
                      }`}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">STARTER</h3>
                          <p className="text-sm text-muted-foreground mt-1">{t('onboarding.plan_starter_desc')}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-500" />
                            <span className="text-foreground">2 agents per swarm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-500" />
                            <span className="text-foreground">30 swarms/month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-500" />
                            <span className="text-foreground">Vault access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-500" />
                            <span className="text-foreground">GPT-4o</span>
                          </div>
                        </div>
                        {selectedPlan === "STARTER" && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {t('onboarding.selected')}
                          </div>
                        )}
                      </div>
                    </motion.button>

                    {/* PROFESSIONAL PLAN */}
                    <motion.button
                      onClick={() => setSelectedPlan("PROFESSIONAL")}
                      whileHover={{ y: -4 }}
                      className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                        selectedPlan === "PROFESSIONAL"
                          ? "border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/10"
                          : "border-border hover:border-yellow-500/30"
                      }`}
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">PROFESSIONAL</h3>
                            <Crown size={18} className="text-yellow-600" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{t('onboarding.plan_pro_desc')}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-yellow-600" />
                            <span className="text-foreground">4 agents per swarm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-yellow-600" />
                            <span className="text-foreground">Unlimited swarms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-yellow-600" />
                            <span className="text-foreground">Vault + War Room + Digital Twin</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-yellow-600" />
                            <span className="text-foreground">14-day trial</span>
                          </div>
                        </div>
                        {selectedPlan === "PROFESSIONAL" && (
                          <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {t('onboarding.selected')}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 9: FINAL ──────── */}
              {step === 9 && (
                <div className="space-y-6">
                  <AureliusBubble text={t('onboarding.aurelius_final_1')} delay={0} />
                  <AureliusBubble text={t('onboarding.aurelius_final_2')} delay={0.3} />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-foreground/80 text-xs uppercase tracking-widest font-bold">{t('onboarding.context_label')}</label>
                      <Textarea
                        placeholder={t('onboarding.context_placeholder')}
                        className="bg-muted border-border focus:border-copper resize-none"
                        rows={3}
                        value={formData.context}
                        onChange={(e) => setFormData((p) => ({ ...p, context: e.target.value }))}
                      />
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-5 space-y-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t('onboarding.recap_title')}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{t('onboarding.recap_brand')}</span>
                          <p className="font-semibold text-foreground">{formData.name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{t('onboarding.recap_industry')}</span>
                          <p className="font-semibold text-foreground">{formData.industry || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{t('onboarding.recap_tone')}</span>
                          <p className="font-semibold text-foreground">{formData.toneOfVoice || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{t('onboarding.recap_audience')}</span>
                          <p className="font-semibold text-foreground truncate">{formData.targetAudience || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {selectedValues.length > 0 && (
                          <span>{t('onboarding.recap_values', { count: selectedValues.length })}</span>
                        )}
                        {selectedPainPoints.length > 0 && (
                          <span>{t('onboarding.recap_pain', { count: selectedPainPoints.length })}</span>
                        )}
                      </div>
                    </div>

                    <AvatarPicker />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation Buttons ── */}
          <div className="flex items-center justify-between px-8 pb-8 md:px-10 md:pb-10">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="border-border text-muted-foreground hover:bg-muted h-11 px-6"
              >
                <ArrowRight size={16} className="mr-2 rotate-180" />
                {t('onboarding.back')}
              </Button>
            ) : (
              <div />
            )}

            {step === 0 ? (
              <div />
            ) : step === 7 ? (
              <div />
            ) : step < STEPS.length - 1 ? (
              <div className="flex items-center gap-3">
                {step === 6 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(STEPS.length - 1)}
                    className="text-muted-foreground hover:text-muted-foreground h-11 px-4 text-xs"
                  >
                    {t('onboarding.skip_to_end')}
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={goNext}
                  className="bg-copper hover:opacity-90 text-white h-11 px-8 shadow-lg shadow-copper/20"
                >
                  {step === 6 ? t('onboarding.see_end') : t('onboarding.continue')}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-copper hover:opacity-90 text-white h-11 px-8 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    {t('onboarding.configuring')}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    {t('onboarding.activate')}
                  </>
                )}
              </Button>
            )}
          </div>
        </main>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground mt-6 font-mono"
        >
          {t('onboarding.step_counter', { current: step + 1, total: STEPS.length })}
          {step > 0 && step < STEPS.length - 1 && (
            <span className="ml-2 text-muted-foreground/50">
              · {step <= 5 ? t('onboarding.section_questions') : step === 6 ? t('onboarding.section_tools') : step === 7 ? t('onboarding.section_documents') : t('onboarding.section_final')}
            </span>
          )}
        </motion.p>
        </div>
      </div>
    </div>
  );
}
