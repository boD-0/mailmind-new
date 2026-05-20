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
  Layout, Bot,
} from "lucide-react";

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
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5f5f] to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-[#ff5f5f]/20">
        <Sparkles size={18} className="text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-gray-200 shadow-sm max-w-[85%]">
        <p className="text-sm leading-relaxed text-gray-700">{text}</p>
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
      className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isExpanded
          ? "border-[#ff5f5f]/30 shadow-lg shadow-[#ff5f5f]/5"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
      onClick={() => onToggle(tool.id)}
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center ${tool.iconColor}`}>
            <tool.icon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">{tool.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">
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
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tool.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
      <motion.div
        className="h-full bg-gradient-to-r from-[#ff5f5f] to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
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
      });

      if (res.success) {
        posthog.capture("onboarding_completed", {
          industry: formData.industry,
          tone_of_voice: formData.toneOfVoice,
          brand_values_count: selectedValues.length,
          pain_points_count: selectedPainPoints.length,
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
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="text-[#ff5f5f] animate-pulse font-display text-xl">{t('onboarding.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#ff5f5f]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {step > 0 && <ProgressBar current={step} total={STEPS.length} />}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
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
                      className="bg-[#ff5f5f] hover:bg-red-500 text-white h-12 px-10 rounded-xl shadow-lg shadow-[#ff5f5f]/25 text-sm font-bold tracking-wide"
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
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">{t('onboarding.brand_label')}</label>
                      <Input
                        placeholder={t('onboarding.brand_placeholder')}
                        className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">{t('onboarding.industry_label')}</label>
                      <Input
                        placeholder={t('onboarding.industry_placeholder')}
                        className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
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
                    <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">{t('onboarding.audience_label')}</label>
                    <Input
                      placeholder={t('onboarding.audience_placeholder')}
                      className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
                    />
                    <p className="text-gray-400 text-xs mt-1 italic">
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
                    <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">{t('onboarding.voice_label')}</label>
                    <Input
                      placeholder={t('onboarding.voice_placeholder')}
                      className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
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
                              ? "border-[#ff5f5f] bg-[#ff5f5f]/5 text-[#ff5f5f] font-semibold"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
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
                            ? "bg-[#ff5f5f] text-white border-[#ff5f5f] shadow-sm"
                            : "bg-transparent border-gray-200 text-gray-500 hover:border-[#ff5f5f] hover:text-[#ff5f5f]"
                        }`}
                        onClick={() => toggleValue(value)}
                      >
                        {value}
                        {selectedValues.includes(value) && <Check size={12} className="ml-1.5" />}
                      </Badge>
                    ))}
                  </motion.div>
                  {selectedValues.length > 0 && (
                    <p className="text-center text-xs text-gray-400">
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
                            ? "border-[#ff5f5f] bg-[#ff5f5f]/5 text-[#ff5f5f]"
                            : "border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300"
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
                      className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-11"
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
                      className="shrink-0 border-gray-200 text-gray-500"
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
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#ff5f5f] transition-colors"
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
                      className="text-center text-xs text-gray-400 italic"
                    >
                      {t('onboarding.click_to_minimize')}
                    </motion.p>
                  )}
                </div>
              )}

              {/* ──────── STEP 7: FINAL ──────── */}
              {step === 7 && (
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
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">{t('onboarding.context_label')}</label>
                      <Textarea
                        placeholder={t('onboarding.context_placeholder')}
                        className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] resize-none"
                        rows={3}
                        value={formData.context}
                        onChange={(e) => setFormData((p) => ({ ...p, context: e.target.value }))}
                      />
                    </div>

                    <div className="bg-[#fdfbf7] rounded-2xl border border-gray-200 p-5 space-y-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t('onboarding.recap_title')}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('onboarding.recap_brand')}</span>
                          <p className="font-semibold text-gray-800">{formData.name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('onboarding.recap_industry')}</span>
                          <p className="font-semibold text-gray-800">{formData.industry || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('onboarding.recap_tone')}</span>
                          <p className="font-semibold text-gray-800">{formData.toneOfVoice || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('onboarding.recap_audience')}</span>
                          <p className="font-semibold text-gray-800 truncate">{formData.targetAudience || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
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
                className="border-gray-200 text-gray-500 hover:bg-gray-50 h-11 px-6"
              >
                <ArrowRight size={16} className="mr-2 rotate-180" />
                {t('onboarding.back')}
              </Button>
            ) : (
              <div />
            )}

            {step === 0 ? (
              <div />
            ) : step < STEPS.length - 1 ? (
              <div className="flex items-center gap-3">
                {step === 6 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(STEPS.length - 1)}
                    className="text-gray-400 hover:text-gray-600 h-11 px-4 text-xs"
                  >
                    {t('onboarding.skip_to_end')}
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={goNext}
                  className="bg-[#ff5f5f] hover:bg-red-500 text-white h-11 px-8 shadow-lg shadow-[#ff5f5f]/20"
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
                className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 hover:from-red-500 hover:to-purple-600 text-white h-11 px-8 shadow-lg shadow-[#ff5f5f]/25"
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
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-gray-400 mt-6 font-mono"
        >
          {t('onboarding.step_counter', { current: step + 1, total: STEPS.length })}
          {step > 0 && step < STEPS.length - 1 && (
            <span className="ml-2 text-gray-300">
              · {step <= 5 ? t('onboarding.section_questions') : step === 6 ? t('onboarding.section_tools') : t('onboarding.section_final')}
            </span>
          )}
        </motion.p>
      </div>
    </div>
  );
}
