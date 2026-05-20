"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BRAND_VALUES = [
  "Inovație", "Exclusivitate", "Integritate", "Eficiență",
  "Empatie", "Transparență", "Sustenabilitate", "Calitate",
  "Autenticitate", "Curaj", "Precizie", "Rafinament",
];

const PAIN_POINTS_OPTIONS = [
  { id: "low-response", label: "Rata de răspuns scăzută", icon: "📉" },
  { id: "poor-personalization", label: "Personalizare insuficientă", icon: "🤖" },
  { id: "time-research", label: "Research consumă prea mult timp", icon: "⏰" },
  { id: "inconsistent-voice", label: "Ton de voce inconsecvent", icon: "🎭" },
  { id: "hard-to-scale", label: "Dificil de scalat outreach-ul", icon: "📈" },
  { id: "no-tracking", label: "Nu pot urmări eficiența", icon: "📊" },
  { id: "low-conversion", label: "Rata de conversie scăzută", icon: "🎯" },
  { id: "wrong-audience", label: "Public țintă neclar definit", icon: "🎪" },
];

const TOOLS = [
  {
    id: "swarm",
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Swarm — Agenți AI Autonomi",
    description: "Patru agenți (Researcher, Psychologist, Strategist, Copywriter) colaborează autonom să creeze outreach hiper-personalizat. Fiecare agent are un rol specializat, iar Consensul validează rezultatul final.",
    features: ["Research automat pe prospect", "Profil psihologic OCEAN", "Strategie de comunicare", "Copywriting personalizat"],
  },
  {
    id: "digital-twin",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Digital Twin — Geamănul Digital",
    description: "Un model psihologic al prospectului bazat pe modelul Big Five (OCEAN). Score-urile de Openness, Conștiinciozitate, Extraversiune, Agreabilitate și Neuroticism ghidează tonul și unghiul mesajului.",
    features: ["Profil OCEAN complet", "Analiză psihologică deep", "Recomandări de ton bazate pe scoruri", "Comparație cu brand values"],
  },
  {
    id: "vault",
    icon: Database,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Vault — Depozit de Asset-uri",
    description: "Stochează brief-uri, referințe, imagini și documente direct în cloud (R2). Tot ce încarci devine context pentru Swarm, rezultând un outreach mai informat și mai coerent.",
    features: ["Upload fișiere direct din dashboard", "Integrare cu contextul Swarm", "Acces sigur și rapid", "Organizare pe proiecte"],
  },
  {
    id: "war-room",
    icon: Layout,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "War Room — Centru de Comandă",
    description: "Monitorizează swarm-urile în timp real, vezi progresul agenților, aprobă strategii și ajustează parametrii. Totul dintr-un singur loc, cu tab-uri pentru Twin, Chat, Tools și API.",
    features: ["Vizualizare live a agenților", "Aprobare strategii cu un click", "Tool-uri speciale: A/B Test, Sequence Builder", "Configurare API și monitorizare usage"],
  },
];

const STEPS = [
  { id: "welcome", label: "Bun venit", icon: Sparkles },
  { id: "brand", label: "Brand", icon: Building2 },
  { id: "audience", label: "Public", icon: Users },
  { id: "voice", label: "Voce", icon: PenLine },
  { id: "values", label: "Valori", icon: HeartHandshake },
  { id: "pain-points", label: "Probleme", icon: TrendingUpDown },
  { id: "tools", label: "Tool-uri", icon: Zap },
  { id: "final", label: "Final", icon: Sparkles },
];

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
      {/* Aurelius avatar */}
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
}: {
  tool: (typeof TOOLS)[number];
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
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
              {isExpanded ? "Click pentru a minimiza" : "Click pentru detalii"}
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [activeTools, setActiveTools] = useState<string[]>([]);
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

  // Auto-scroll when content changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ── Navigation ──

  const goNext = () => {
    if (step === 1 && (!formData.name || !formData.industry)) {
      toast.error("Completează numele brandului și industria.");
      return;
    }
    if (step === 2 && !formData.targetAudience) {
      toast.error("Specifică publicul țintă.");
      return;
    }
    if (step === 3 && !formData.toneOfVoice) {
      toast.error("Alege tonul de voce.");
      return;
    }
    if (step === 4 && selectedValues.length === 0) {
      toast.error("Selectează cel puțin o valoare de brand.");
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
        toast.success("Totul e configurat! Bine ai venit în MailMind.");
        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(res.error || "Ceva nu a mers bine.");
      }
    } catch {
      toast.error("Eroare de conexiune.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="text-[#ff5f5f] animate-pulse font-display text-xl">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#ff5f5f]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* ── Progress Bar ── */}
        {step > 0 && <ProgressBar current={step} total={STEPS.length} />}

        {/* ── Step Content ── */}
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
                  {/* Aurelius intro */}
                  <AureliusBubble
                    text="Bun venit în MailMind! 👋 Sunt Aurelius, asistentul tău AI. O să te ghidez pas cu pas prin configurarea contului tău. Hai să ne cunoaștem!"
                    delay={0}
                  />
                  <AureliusBubble
                    text="Îți voi pune câteva întrebări despre brandul tău, apoi îți voi prezenta tool-urile puternice pe care le ai la dispoziție. Totul durează cam 2-3 minute."
                    delay={0.3}
                  />
                  <AureliusBubble
                    text="Sunt aici să te ajut — dacă ai întrebări pe parcurs, nu ezita să le pui. Acum, să începem!"
                    delay={0.6}
                  />

                  {/* Start button */}
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
                      Să începem!
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 1: Brand ──────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <AureliusBubble
                    text="Pentru început, spune-mi despre brandul tău. Cum te numești și în ce industrie activezi? Astea mă ajută să înțeleg contextul în care vei lucra."
                    delay={0}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <div className="space-y-2">
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">Nume Brand *</label>
                      <Input
                        placeholder="Ex: MailMind"
                        className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">Industrie *</label>
                      <Input
                        placeholder="Ex: SaaS / Tehnologie"
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
                  <AureliusBubble
                    text="Acum, spune-mi cui te adresezi. Cu cât îmi dai mai multe detalii despre publicul tău țintă, cu atât mai bine voi putea personaliza mesajele. Gândește-te la clientul tău ideal."
                    delay={0}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">Public Țintă *</label>
                    <Input
                      placeholder="Ex: Fondatori de startup-uri tech, Directori de vânzări în enterprise"
                      className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
                    />
                    <p className="text-gray-400 text-xs mt-1 italic">
                      Sfat: &quot;CMO-uri în companii B2B cu 50-500 angajați&quot; e mai util decât &quot;toată lumea&quot;
                    </p>
                  </motion.div>
                </div>
              )}

              {/* ──────── STEP 3: Tone of Voice ──────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <AureliusBubble
                    text="Cum sună brandul tău? Tonul vocii este esențial — el definește personalitatea comunicării tale. Poți alege un ton existent sau poți combina. De exemplu: profesional dar prietenos."
                    delay={0}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">Ton de Voce *</label>
                    <Input
                      placeholder="Ex: Profesional dar prietenos, Autoritar, Cald și empatic"
                      className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] h-12"
                      value={formData.toneOfVoice}
                      onChange={(e) => setFormData((p) => ({ ...p, toneOfVoice: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["Direct", "Profesional", "Prietenos", "Academic", "Inspirațional", "Autoritar", "Empatic", "Jucăuș"].map((tone) => (
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
                  <AureliusBubble
                    text="Valorile brandului sunt principiile care îți ghidează comunicarea. Ele vor influența modul în care Swarm-ul meu abordează fiecare campanie. Alege cel puțin una — câte vrei!"
                    delay={0}
                  />
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
                      {selectedValues.length} valori selectate
                    </p>
                  )}
                </div>
              )}

              {/* ──────── STEP 5: Pain Points ──────── */}
              {step === 5 && (
                <div className="space-y-6">
                  <AureliusBubble
                    text="Ultimele întrebări despre brand! Cu ce provocări te confrunți în outreach-ul tău? Selectează-le pe cele care rezonează cu tine — mă vor ajuta să prioritizez soluțiile potrivite."
                    delay={0}
                  />
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
                      placeholder="Altă provocare (opțional)..."
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
                      Adaugă
                    </Button>
                  </div>
                </div>
              )}

              {/* ──────── STEP 6: TOOL SHOWCASE ──────── */}
              {step === 6 && (
                <div className="space-y-6">
                  <AureliusBubble
                    text="Perfect! Am reținut totul despre brandul tău. Acum, hai să-ți arăt ce poate face MailMind pentru tine. Fiecare tool e gândit să transforme modul în care faci outreach."
                    delay={0}
                  />
                  <AureliusBubble
                    text="Apasă pe fiecare tool pentru detalii — sunt create să lucreze împreună ca un sistem integrat."
                    delay={0.3}
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3 pt-2"
                  >
                    {/* Toggle all button */}
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
                        {allToolsOpen ? "Închide toate" : "Deschide toate"}
                      </button>
                    </div>

                    {TOOLS.map((tool, i) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        index={i}
                        isExpanded={activeTools.includes(tool.id)}
                        onToggle={toggleTool}
                      />
                    ))}
                  </motion.div>

                  {activeTools.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-gray-400 italic"
                    >
                      Apasă din nou pe card pentru a-l minimiza
                    </motion.p>
                  )}
                </div>
              )}

              {/* ──────── STEP 7: FINAL ──────── */}
              {step === 7 && (
                <div className="space-y-6">
                  <AureliusBubble
                    text="Atingeri finale! Alege-ți avatarul și adaugă orice context suplimentar dorești. Apoi voi activa totul și vei fi gata să începi."
                    delay={0}
                  />
                  <AureliusBubble
                    text="După finalizare, vei fi redirecționat în Dashboard, unde mă poți găsi oricând în colțul din dreapta jos. 💬"
                    delay={0.3}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Context */}
                    <div className="space-y-2">
                      <label className="text-gray-700 text-xs uppercase tracking-widest font-bold">Context / Slogan</label>
                      <Textarea
                        placeholder="Misiune, slogan, sau orice altceva ce vrei să știm..."
                        className="bg-gray-50 border-gray-200 focus:border-[#ff5f5f] resize-none"
                        rows={3}
                        value={formData.context}
                        onChange={(e) => setFormData((p) => ({ ...p, context: e.target.value }))}
                      />
                    </div>

                    {/* Recap */}
                    <div className="bg-[#fdfbf7] rounded-2xl border border-gray-200 p-5 space-y-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Recap</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Brand</span>
                          <p className="font-semibold text-gray-800">{formData.name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Industrie</span>
                          <p className="font-semibold text-gray-800">{formData.industry || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Ton</span>
                          <p className="font-semibold text-gray-800">{formData.toneOfVoice || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Public</span>
                          <p className="font-semibold text-gray-800 truncate">{formData.targetAudience || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        {selectedValues.length > 0 && (
                          <span>{selectedValues.length} valori</span>
                        )}
                        {selectedPainPoints.length > 0 && (
                          <span>{selectedPainPoints.length} provocări</span>
                        )}
                      </div>
                    </div>

                    {/* Avatar */}
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
                Înapoi
              </Button>
            ) : (
              <div />
            )}

            {step === 0 ? (
              <div /> /* Start button is inside the step content */
            ) : step < STEPS.length - 1 ? (
              <div className="flex items-center gap-3">
                {step === 6 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(STEPS.length - 1)}
                    className="text-gray-400 hover:text-gray-600 h-11 px-4 text-xs"
                  >
                    Am înțeles, mergi la final
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={goNext}
                  className="bg-[#ff5f5f] hover:bg-red-500 text-white h-11 px-8 shadow-lg shadow-[#ff5f5f]/20"
                >
                  {step === 6 ? "Vezi finalul" : "Continuă"}
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
                    Se configurează...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Activează MailMind
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* ── Step Counter ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-gray-400 mt-6 font-mono"
        >
          Pasul {step + 1} din {STEPS.length}
          {step > 0 && step < STEPS.length - 1 && (
            <span className="ml-2 text-gray-300">
              · {step <= 5 ? "Întrebări" : step === 6 ? "Prezentare tool-uri" : "Finalizare"}
            </span>
          )}
        </motion.p>
      </div>
    </div>
  );
}
