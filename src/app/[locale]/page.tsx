'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Menu, X, ArrowRight, Check, Search, Brain, Target, PenTool,
  Play, Send, Mail, Plus, Sparkles, Globe, Heart, Shield
} from "lucide-react"

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const specialists = [
  {
    name: "The Researcher",
    icon: Search,
    bg: "bg-emerald-100",
    iconBg: "bg-emerald-200 text-emerald-700",
    border: "border-emerald-200",
    description:
      "Scans LinkedIn, news, podcasts and press to surface the precise intel you need — right-moment context that makes your email land.",
  },
  {
    name: "The Psychologist",
    icon: Brain,
    bg: "bg-amber-100",
    iconBg: "bg-amber-200 text-amber-700",
    border: "border-amber-200",
    description:
      "Builds a Big Five OCEAN profile — your Digital Twin. Public signals become a map of how they think, feel, and decide.",
  },
  {
    name: "The Strategist",
    icon: Target,
    bg: "bg-indigo-100",
    iconBg: "bg-indigo-200 text-indigo-700",
    border: "border-indigo-200",
    description:
      "Plans the outreach angle, hook, tone, and sequence. Knows what to say, in what order, and why it will work.",
  },
  {
    name: "The Copywriter",
    icon: PenTool,
    bg: "bg-rose-100",
    iconBg: "bg-rose-200 text-rose-700",
    border: "border-rose-200",
    description:
      "Writes the actual email — personalized, calibrated, and human. Not a template. A message crafted for one person.",
  },
]

const demoSteps = [
  { icon: Search, label: "Research", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { icon: Brain, label: "Profile", color: "bg-amber-100 text-amber-600 border-amber-200" },
  { icon: Target, label: "Strategy", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { icon: PenTool, label: "Write", color: "bg-rose-100 text-rose-600 border-rose-200" },
  { icon: Send, label: "Send", color: "bg-purple-100 text-purple-600 border-purple-200" },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    badge: null,
    features: [
      "1 AI scan per day",
      "1 swarm per day",
      "Basic research only",
      "1 active agent",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    badge: "POPULAR",
    features: [
      "Unlimited weekly launches",
      "1000 memory seeds",
      "Full swarm access",
      "Vault included",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    badge: null,
    features: [
      "Unlimited everything",
      "Team seats",
      "CRM integration",
      "Custom onboarding",
      "Dedicated support",
    ],
    cta: "Contact Us",
    highlight: false,
  },
]

const faqs = [
  {
    q: "How is this different from ChatGPT or a template?",
    a: "MailMind uses 4 specialized agents that research your prospect in real-time, build a psychological profile, and write a custom email — not a template filled with variables.",
  },
  {
    q: "What is the OCEAN profile all about?",
    a: "OCEAN (Big Five) is the gold standard personality model used in psychology research. Our Psychologist agent builds a Digital Twin from public signals to predict how your prospect thinks, feels, and decides.",
  },
  {
    q: "Are emails actually sent?",
    a: "No — MailMind writes and optimizes your email. You send it through your existing email client or connect your CRM.",
  },
  {
    q: "What about email deliverability?",
    a: "We include a Sandbox simulation that predicts prospect reaction and a SpamGuard check before you send anything.",
  },
  {
    q: "Is my data protected?",
    a: "Yes. All prospect data is processed ephemerally and never stored or used for model training. We are SOC 2 compliant.",
  },
  {
    q: "How fast will I get results?",
    a: "Most users see a complete, ready-to-send email in under 90 seconds from entering a prospect name.",
  },
]

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */



const cardAnimation = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  viewport: { once: true } as const,
})

/* ════════════════════════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════════════════════════ */

/* ── 1. HEADER ── */

function Header({ locale }: { locale: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#fdfbf7]/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ff5f5f] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-extrabold tracking-tight">M</span>
          </div>
          <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">MailMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <a href="#features" className="hover:text-[#1a1a1a] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1a1a1a] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#1a1a1a] transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href={`/${locale}/login`} className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors">
            Log in
          </Link>
          <Link
            href={`/${locale}/sign-up`}
            className="bg-[#ff5f5f] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-[#1a1a1a] transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200/50 flex flex-col gap-2">
              {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex gap-3 pt-2 mt-2 border-t border-gray-100">
                <Link
                  href={`/${locale}/login`}
                  className="flex-1 text-center text-sm font-medium text-gray-600 px-4 py-2.5 border border-gray-300 rounded-full hover:border-gray-400 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href={`/${locale}/sign-up`}
                  className="flex-1 text-center bg-[#ff5f5f] text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-red-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── 2. HERO ── */

function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="pt-24 pb-20 px-6 text-center bg-[#fdfbf7]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-[#ff5f5f]/10 text-[#ff5f5f] text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-8">
            <Sparkles size={12} />
            The AI Swarm for Outreach
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-[#1a1a1a]"
        >
          Cold email, but it{" "}
          <span className="bg-[#ff5f5f]/10 text-[#ff5f5f] px-3 py-1 rounded-lg">actually knows</span>{" "}
          them.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
Four specialized AI agents — Researcher, Psychologist, Strategist and Copywriter — work in parallel
to craft psychologically calibrated emails that don&apos;t sound like they came from a template.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={`/${locale}/sign-up`}
            className="bg-[#ff5f5f] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 inline-flex items-center gap-2 group"
          >
            Get Started Now
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="border border-gray-300 text-gray-600 px-8 py-3.5 rounded-full font-semibold hover:border-gray-400 hover:text-[#1a1a1a] transition-all inline-flex items-center gap-2"
          >
            <Play size={16} />
            Live Demo
          </Link>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-16"
        >
          <div className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-1.5 px-5 py-3 bg-white border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 max-w-[50%] mx-auto h-7 bg-gray-50 rounded-lg flex items-center px-3 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">app.mailmind.app</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 md:p-8 bg-white">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-16 bg-emerald-50 rounded-xl border border-emerald-100 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                    <Search size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="h-2 w-12 bg-emerald-200 rounded-full mb-1" />
                    <div className="h-1.5 w-8 bg-emerald-100 rounded-full" />
                  </div>
                </div>
                <div className="h-16 bg-amber-50 rounded-xl border border-amber-100 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
                    <Brain size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="h-2 w-12 bg-amber-200 rounded-full mb-1" />
                    <div className="h-1.5 w-8 bg-amber-100 rounded-full" />
                  </div>
                </div>
                <div className="h-16 bg-rose-50 rounded-xl border border-rose-100 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-200 rounded-lg flex items-center justify-center">
                    <PenTool size={14} className="text-rose-600" />
                  </div>
                  <div>
                    <div className="h-2 w-12 bg-rose-200 rounded-full mb-1" />
                    <div className="h-1.5 w-8 bg-rose-100 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-[#ff5f5f] to-rose-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 3. FEATURES — 4 SPECIALISTS ── */

function FeaturesSection() {
  const pastelBgs = ["bg-emerald-50", "bg-amber-50", "bg-indigo-50", "bg-rose-50"]

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
            The Specialists
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4">
            Not one model.{" "}
            <span className="text-[#ff5f5f]">Four specialists.</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
            Each agent is great at exactly one thing. Together they replace your team — and more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialists.map((specialist, i) => {
            const Icon = specialist.icon
            return (
              <motion.div
                key={specialist.name}
                {...cardAnimation(i)}
                className={`border ${specialist.border} rounded-2xl shadow-sm ${pastelBgs[i]} p-6 hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${specialist.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${specialist.iconBg}`}>
                      {specialist.name}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {specialist.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── 4. INTERACTIVE DEMO (Zero-copy-paste) ── */

function InteractiveDemoSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#fdfbf7]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4">
            One command.{" "}
            <span className="text-[#ff5f5f]">Zero copy-paste.</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
            From prospect name to calibrated email in under 90 seconds.
          </p>
        </motion.div>

        {/* Step labels */}
        <div className="hidden md:flex items-center justify-between mb-4 px-2">
          {["Research", "Profile", "Strategy", "Copy", "Send"].map((label, i) => (
            <span key={label} className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {/* Progress line */}
        <div className="hidden md:block relative h-0.5 bg-gray-200 rounded-full mb-8 mx-2">
          <div className="absolute inset-y-0 left-0 w-[80%] bg-gradient-to-r from-emerald-400 via-amber-400 via-indigo-400 to-rose-400 rounded-full" />
        </div>

        {/* 5 Horizontal colored cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {demoSteps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                {...cardAnimation(i)}
                className={`${step.color} border rounded-xl p-4 md:p-5 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all hover:-translate-y-1 cursor-default`}
              >
                <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold tracking-wide">{step.label}</span>
                <span className="text-[10px] text-gray-500 font-medium hidden md:block">
                  {["Deep scan of prospect data", "Build psychological profile", "Plan outreach angle", "Craft personalized email", "Ready to deploy"][i]}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Mobile friendly description */}
        <div className="mt-6 text-center md:hidden">
          <p className="text-xs text-gray-400">
            Research → Profile → Strategy → Copy → Send
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── 5. DIFFERENTIATION (We write to a person) ── */

function DifferentiationSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
            The Difference
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-6 leading-[1.1]">
            We don&apos;t write to a{" "}
            <span className="line-through text-gray-300">job title.</span>
            <br />
            We write to a{" "}
            <span className="text-[#ff5f5f]">person.</span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Most outreach tools blast the same template to hundreds of people. MailMind builds a psychological
            profile of each prospect — their motivations, communication style, and decision-making patterns —
            then crafts an email calibrated specifically for them.
          </p>
          <ul className="space-y-3">
            {[
              "Big Five OCEAN profile built from public signals",
              "Personality-matched tone, hook, and angle for every email",
              "Sandbox simulation predicts prospect reaction before you send",
              "Continuous learning from engagement patterns",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-emerald-600" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Diagram/Visual SVG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-sm bg-[#fdfbf7] rounded-2xl border border-gray-200 p-6 shadow-sm">
            {/* OCEAN Radar Chart SVG */}
            <svg viewBox="0 0 240 240" className="w-full h-auto">
              {/* Grid pentagon */}
              <polygon
                points="120,20 212,80 212,170 120,220 28,170 28,80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <polygon
                points="120,55 189,100 189,155 120,190 51,155 51,100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <polygon
                points="120,90 166,120 166,150 120,160 74,150 74,120"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />

              {/* Data fill */}
              <polygon
                points="120,35 195,100 185,175 120,195 55,175 45,100"
                fill="#ff5f5f"
                fillOpacity="0.12"
                stroke="#ff5f5f"
                strokeWidth="2"
              />
              {/* Data points */}
              <circle cx="120" cy="35" r="3" fill="#ff5f5f" />
              <circle cx="195" cy="100" r="3" fill="#ff5f5f" />
              <circle cx="185" cy="175" r="3" fill="#ff5f5f" />
              <circle cx="120" cy="195" r="3" fill="#ff5f5f" />
              <circle cx="55" cy="175" r="3" fill="#ff5f5f" />
              <circle cx="45" cy="100" r="3" fill="#ff5f5f" />

              {/* Labels */}
              <text x="120" y="14" textAnchor="middle" className="text-[8px] font-bold" fill="#1a1a1a">Openness</text>
              <text x="222" y="104" textAnchor="start" className="text-[8px] font-bold" fill="#1a1a1a">Extraversion</text>
              <text x="210" y="190" textAnchor="start" className="text-[8px] font-bold" fill="#1a1a1a">Consc.</text>
              <text x="120" y="233" textAnchor="middle" className="text-[8px] font-bold" fill="#1a1a1a">Agree.</text>
              <text x="18" y="190" textAnchor="end" className="text-[8px] font-bold" fill="#1a1a1a">Neurot.</text>
              <text x="28" y="104" textAnchor="end" className="text-[8px] font-bold" fill="#1a1a1a">Extra.</text>
            </svg>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-[#1a1a1a]">OCEAN Profile</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f5f]" />
                  Digital Twin
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 6. PRICING ── */

function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#fdfbf7]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...cardAnimation(i)}
              className={`rounded-2xl p-8 border bg-white relative flex flex-col ${
                plan.highlight
                  ? "border-[#ff5f5f] border-2 shadow-lg shadow-red-100/50 scale-105 md:scale-105"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-[#ff5f5f] text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                  {plan.badge}
                </span>
              )}
              <h3 className={`font-bold text-lg mb-1 text-[#1a1a1a] ${plan.highlight ? "mt-2" : ""}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold tracking-tighter text-[#1a1a1a]">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-[#ff5f5f] text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-200/50"
                    : "border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-[#1a1a1a]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 7. FAQ ── */

function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center text-[#1a1a1a]"
        >
          Frequently asked questions.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-600 text-center mb-12"
        >
          Everything you need to know about MailMind.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-[#1a1a1a] hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 8. FINAL CTA ── */

function FinalCTASection() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <section className="bg-[#ff5f5f] py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4 leading-[1.1]"
        >
          Ready to send emails{" "}
          <span className="italic font-bold">that get replies?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          Join thousands of founders and SDRs who already ship with MailMind.
        </motion.p>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-md mx-auto px-6 py-4 rounded-full bg-white/15 text-white text-sm font-medium"
          >
            ✓ You&apos;re in! Check your inbox for next steps.
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1 w-full">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-11 pr-5 py-3.5 rounded-full text-sm outline-none text-[#1a1a1a] placeholder:text-gray-400 bg-white border-0 focus:ring-2 focus:ring-white/30 transition-shadow"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#1a1a1a] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20 inline-flex items-center gap-2 group whitespace-nowrap"
            >
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.form>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 pt-10 border-t border-white/15 flex flex-wrap justify-center gap-6 text-xs text-white/60"
        >
          <span className="flex items-center gap-1.5">
            <Shield size={12} />
            SOC 2 Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={12} />
            99.9% Uptime
          </span>
          <span className="flex items-center gap-1.5">
            <Heart size={12} />
            No credit card required
          </span>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 9. FOOTER ── */

function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-[#fdfbf7] border-t border-gray-200 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#ff5f5f] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-extrabold">M</span>
              </div>
              <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">MailMind</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[200px]">
              AI-powered outreach that actually knows people.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Product</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-[#1a1a1a] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#1a1a1a] transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#1a1a1a] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#1a1a1a] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#1a1a1a] transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Legal</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#1a1a1a] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#1a1a1a] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <span>&copy; 2025 MailMind. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Twitter/X</a>
            <a href="#" className="hover:text-gray-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-gray-600 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { locale } = useParams()
  const l = locale as string

  return (
    <main className="bg-[#fdfbf7] text-[#1a1a1a] font-sans antialiased selection:bg-[#ff5f5f]/20 selection:text-[#1a1a1a]">
      <Header locale={l} />
      <HeroSection locale={l} />
      <FeaturesSection />
      <InteractiveDemoSection />
      <DifferentiationSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer locale={l} />
    </main>
  )
}
