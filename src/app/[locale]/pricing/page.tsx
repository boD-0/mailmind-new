'use client'

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Menu, X, ArrowRight, Check, Mail, Sparkles, Globe, Heart, Shield,
  ChevronDown, Crown,
} from "lucide-react"

/* ════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
}

const fadeUpScale: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ════════════════════════════════════════════════════════════
   PLAN DATA — matches gatekeeper PLAN_LIMITS
   ════════════════════════════════════════════════════════════ */

const TIERS = [
  {
    id: "FREE" as const,
    name: "Free",
    price: "$0",
    period: "/month",
    badge: null,
    description: "Perfect for testing the waters — one prospect at a time.",
    features: [
      { label: "AI Agents", value: "1 agent" },
      { label: "AI Model", value: "GPT-4o-mini" },
      { label: "Vault (File Storage)", included: false },
      { label: "War Room", included: false },
      { label: "Digital Twin", included: false },
      { label: "Idea Capture", included: true },
      { label: "Aurelius AI Assistant", included: true },
      { label: "Basic Research", included: true },
    ],
    cta: "Try Free",
    ctaHref: "sign-up",
    highlight: false,
    color: "gray",
  },
  {
    id: "STARTER" as const,
    name: "Starter",
    price: "$49",
    period: "/month",
    badge: "POPULAR",
    description: "For growing teams that need better research and storage.",
    features: [
      { label: "AI Agents", value: "2 agents" },
      { label: "AI Model", value: "GPT-4o" },
      { label: "Vault (File Storage)", included: true },
      { label: "War Room", included: false },
      { label: "Digital Twin", included: false },
      { label: "Idea Capture", included: true },
      { label: "Aurelius AI Assistant", included: true },
      { label: "Advanced Research", included: true },
    ],
    cta: "Get Started",
    ctaHref: "sign-up",
    highlight: true,
    color: "red",
  },
  {
    id: "PROFESSIONAL" as const,
    name: "Professional",
    price: "$149",
    period: "/month",
    badge: null,
    description: "Full power — unlock the complete MailMind swarm.",
    features: [
      { label: "AI Agents", value: "4 agents" },
      { label: "AI Model", value: "GPT-4o" },
      { label: "Vault (File Storage)", included: true },
      { label: "War Room", included: true },
      { label: "Digital Twin", included: true },
      { label: "Idea Capture", included: true },
      { label: "Aurelius AI Assistant", included: true },
      { label: "Full Research Suite", included: true },
    ],
    cta: "Go Pro",
    ctaHref: "sign-up",
    highlight: false,
    color: "purple",
  },
]

const ALL_FEATURES = [
  { label: "AI Agents", key: "agents" as const },
  { label: "AI Model", key: "model" as const },
  { label: "Vault (File Storage)", key: "vault" as const },
  { label: "War Room", key: "warroom" as const },
  { label: "Digital Twin", key: "twin" as const },
  { label: "Idea Capture", key: "ideas" as const },
  { label: "Aurelius AI Assistant", key: "aurelius" as const },
  { label: "Basic Research", key: "basicResearch" as const },
  { label: "Advanced Research", key: "advResearch" as const },
  { label: "Full Research Suite", key: "fullResearch" as const },
]

const PLAN_DETAILS: Record<string, Record<string, string | boolean>> = {
  FREE: {
    agents: "1 agent",
    model: "GPT-4o-mini",
    vault: false,
    warroom: false,
    twin: false,
    ideas: true,
    aurelius: true,
    basicResearch: true,
    advResearch: false,
    fullResearch: false,
  },
  STARTER: {
    agents: "2 agents",
    model: "GPT-4o",
    vault: true,
    warroom: false,
    twin: false,
    ideas: true,
    aurelius: true,
    basicResearch: false,
    advResearch: true,
    fullResearch: false,
  },
  PROFESSIONAL: {
    agents: "4 agents",
    model: "GPT-4o",
    vault: true,
    warroom: true,
    twin: true,
    ideas: true,
    aurelius: true,
    basicResearch: false,
    advResearch: false,
    fullResearch: true,
  },
}

const pricingFAQs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade at any time. When upgrading, you get immediate access to your new features. When downgrading, changes apply at the end of your billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is available forever with no credit card required. Upgrade to Starter or Professional when you're ready for more power.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe or Polar.sh.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Absolutely. You can cancel anytime from your account settings. Your access continues until the end of the current billing period — no questions asked.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is preserved for 30 days after cancellation. If you reactivate within that period, everything is restored. After 30 days, data is permanently deleted.",
  },
  {
    q: "Do you offer custom plans for teams?",
    a: "Yes — we offer custom enterprise plans with dedicated support, custom onboarding, and volume discounts. Contact us for details.",
  },
]

/* ════════════════════════════════════════════════════════════
   DECORATIVE COMPONENTS
   ════════════════════════════════════════════════════════════ */

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#ff5f5f]/5 to-purple-300/5 blur-3xl"
        animate={{ x: [0, 40, 0, -30, 0], y: [0, -30, 20, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/5 to-[#ff5f5f]/5 blur-3xl"
        animate={{ x: [0, -50, 20, 30, 0], y: [0, 30, -20, -10, 0], scale: [1, 0.9, 1.05, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/5 to-rose-200/5 blur-3xl"
        animate={{ x: [0, 30, -20, 10, 0], y: [0, -20, 30, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   HEADER
   ════════════════════════════════════════════════════════════ */

function Header({ locale }: { locale: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY, [0, 60],
    ["rgba(253, 251, 247, 0.6)", "rgba(253, 251, 247, 0.9)"]
  )

  return (
    <motion.header
      style={{ backgroundColor: headerBg }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <motion.div
            className="w-8 h-8 bg-[#ff5f5f] rounded-xl flex items-center justify-center shadow-sm"
            whileHover={{ rotate: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-white text-xs font-extrabold tracking-tight">M</span>
          </motion.div>
          <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">MailMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <Link href={`/${locale}/#features`} className="relative hover:text-[#1a1a1a] transition-colors group">
            Features
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#how-it-works`} className="relative hover:text-[#1a1a1a] transition-colors group">
            How it works
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <span className="text-[#1a1a1a] font-semibold">Pricing</span>
          <Link href={`/${locale}/#faq`} className="relative hover:text-[#1a1a1a] transition-colors group">
            FAQ
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
          >
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
          <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-4 pt-4 border-t border-gray-200/50 flex flex-col gap-2">
              <Link href={`/${locale}/#features`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">Features</Link>
              <Link href={`/${locale}/#how-it-works`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">How it works</Link>
              <span className="text-sm text-[#1a1a1a] font-semibold px-3 py-2">Pricing</span>
              <Link href={`/${locale}/#faq`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">FAQ</Link>
              <div className="flex gap-3 pt-2 mt-2 border-t border-gray-100">
                <Link href={`/${locale}/login`} className="flex-1 text-center text-sm font-medium text-gray-600 px-4 py-2.5 border border-gray-300 rounded-full hover:border-gray-400 transition-colors">Log in</Link>
                <Link href={`/${locale}/sign-up`} className="flex-1 text-center bg-[#ff5f5f] text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-red-500 transition-colors">Get Started</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ════════════════════════════════════════════════════════════
   PRICING HERO
   ════════════════════════════════════════════════════════════ */

function PricingHero() {
  return (
    <section className="relative pt-28 pb-16 px-6 text-center bg-[#fdfbf7] overflow-hidden">
      <FloatingOrbs />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.span
            className="inline-flex items-center gap-1.5 bg-[#ff5f5f]/10 text-[#ff5f5f] text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={12} />
            Simple, Transparent Pricing
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-[#1a1a1a]"
        >
          Choose your{" "}
          <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
            power level.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Start for free, upgrade when you need more agents, storage, or the full War Room experience.
          Cancel anytime. No hidden fees.
        </motion.p>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   PRICING CARDS
   ════════════════════════════════════════════════════════════ */

function PricingCards({ locale }: { locale: string }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")

  const getPrice = (base: string, plan: string) => {
    if (plan === "FREE") return "$0"
    if (billing === "annual") {
      const monthly = parseInt(base.replace("$", ""))
      return `$${Math.round(monthly * 10)}`
    }
    return base
  }

  const getPeriod = (plan: string) => {
    if (plan === "FREE") return ""
    return billing === "annual" ? "/year" : "/month"
  }

  return (
    <section className="relative pb-16 px-6 bg-[#fdfbf7]">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition-colors ${
              billing === "monthly" ? "text-[#1a1a1a]" : "text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              billing === "annual" ? "bg-[#ff5f5f]" : "bg-gray-200"
            }`}
          >
            <motion.span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
              animate={{ x: billing === "annual" ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`text-sm font-medium transition-colors ${
              billing === "annual" ? "text-[#1a1a1a]" : "text-gray-400"
            }`}
          >
            Annual
            <span className="ml-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              variants={fadeUpScale}
              custom={i * 0.12}
              className={`rounded-2xl p-8 border bg-white relative flex flex-col ${
                tier.highlight
                  ? "border-[#ff5f5f] border-2 shadow-xl shadow-red-100/60 scale-[1.02] lg:scale-105"
                  : "border-gray-200 shadow-sm"
              }`}
              whileHover={{
                y: tier.highlight ? -8 : -6,
                boxShadow: tier.highlight
                  ? "0 24px 48px rgba(255, 95, 95, 0.18)"
                  : "0 12px 30px rgba(0,0,0,0.08)",
                transition: { duration: 0.3 },
              }}
            >
              {tier.badge && (
                <motion.span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-[#ff5f5f] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
                >
                  <Crown size={10} />
                  {tier.badge}
                </motion.span>
              )}

              {/* Plan name */}
              <div className={`${tier.highlight ? "mt-2" : ""}`}>
                <h3 className="font-bold text-lg text-[#1a1a1a]">{tier.name}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 my-6">
                <motion.span
                  className="text-5xl font-extrabold tracking-tighter text-[#1a1a1a]"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                  key={billing}
                >
                  {getPrice(tier.price, tier.id)}
                </motion.span>
                <span className="text-gray-400 text-sm">{getPeriod(tier.id)}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <motion.li
                    key={f.label}
                    className="flex items-center gap-2.5 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    {'included' in f ? (
                      f.included ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <X size={11} className="text-gray-300" />
                        </div>
                      )
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#ff5f5f]/10 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-[#ff5f5f]" />
                      </div>
                    )}
                    <span className={('included' in f && !f.included) ? "text-gray-400" : "text-gray-600"}>
                      {f.value || f.label}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/${locale}/${tier.ctaHref}`}
                className={`w-full py-3.5 rounded-full font-semibold text-sm text-center transition-all inline-flex items-center justify-center gap-2 group ${
                  tier.highlight
                    ? "bg-[#ff5f5f] text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-200/50"
                    : tier.id === "PROFESSIONAL"
                    ? "bg-gradient-to-r from-[#ff5f5f] to-purple-600 text-white hover:shadow-lg hover:shadow-purple-200/50"
                    : "border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-[#1a1a1a]"
                }`}
              >
                {tier.cta}
                <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   COMPARISON TABLE
   ════════════════════════════════════════════════════════════ */

function ComparisonTable({ locale }: { locale: string }) {
  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 px-4 py-1.5 rounded-full bg-gray-100/50 border border-gray-200/50">
            Full Comparison
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4">
            Every feature,{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
              side by side.
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
            See exactly what you get at each tier.
          </p>
        </motion.div>

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase text-gray-500 w-1/3">
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.id}
                    className={`text-center px-6 py-4 text-sm font-bold ${
                      tier.highlight ? "text-[#ff5f5f]" : "text-[#1a1a1a]"
                    }`}
                  >
                    {tier.name}
                    {tier.highlight && (
                      <span className="ml-2 text-[10px] bg-[#ff5f5f]/10 text-[#ff5f5f] px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "AI Agents", key: "agents" },
                { label: "AI Model", key: "model" },
                { label: "Vault (File Storage)", key: "vault" },
                { label: "War Room", key: "warroom" },
                { label: "Digital Twin", key: "twin" },
                { label: "Idea Capture", key: "ideas" },
                { label: "Aurelius AI Assistant", key: "aurelius" },
                { label: "Basic Research", key: "basicResearch" },
                { label: "Advanced Research", key: "advResearch" },
                { label: "Full Research Suite", key: "fullResearch" },
              ].map((row, i) => (
                <motion.tr
                  key={row.key}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className={`border-b border-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">{row.label}</td>
                  {TIERS.map((tier) => {
                    const val = PLAN_DETAILS[tier.id]![row.key]
                    return (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {val === true ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <Check size={13} className="text-emerald-600" />
                          </div>
                        ) : val === false ? (
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                            <X size={13} className="text-gray-300" />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700 font-medium">{String(val)}</span>
                        )}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile comparison cards */}
        <div className="md:hidden space-y-4">
          {ALL_FEATURES.map((feat) => (
            <motion.div
              key={feat.key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
            >
              <p className="text-sm font-semibold text-[#1a1a1a] mb-3">{feat.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((tier) => {
                  const val = PLAN_DETAILS[tier.id]![feat.key]
                  return (
                    <div key={tier.id} className="text-center">
                      <span className="text-[10px] font-semibold uppercase text-gray-400 block mb-1">{tier.name}</span>
                      {val === true ? (
                        <Check size={14} className="text-emerald-500 mx-auto" />
                      ) : val === false ? (
                        <X size={14} className="text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-xs text-gray-700 font-medium">{String(val)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href={`/${locale}/sign-up`}
            className="inline-flex items-center gap-2 bg-[#ff5f5f] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 group"
          >
            Start Free — No Credit Card Required
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   FAQ
   ════════════════════════════════════════════════════════════ */

function PricingFAQ() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <section className="relative py-24 px-6 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4">
            Pricing{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
              FAQ.
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about plans and billing.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-3"
        >
          {pricingFAQs.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i * 0.05}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenId(openId === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#1a1a1a] pr-4">{item.q}</span>
                <motion.div
                  animate={{ rotate: openId === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openId === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   CTA
   ════════════════════════════════════════════════════════════ */

function PricingCTA({ locale }: { locale: string }) {
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
    <section className="relative bg-gradient-to-br from-[#ff5f5f] to-purple-600 py-24 px-6 text-center overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {[
        { top: "10%", left: "5%", size: 60, delay: 0 },
        { top: "70%", right: "10%", size: 40, delay: 1 },
        { top: "20%", right: "15%", size: 30, delay: 2 },
        { bottom: "15%", left: "10%", size: 50, delay: 0.5 },
      ].map((shape, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/5 rounded-full"
          style={{
            top: shape.top, left: shape.left,
            right: (shape as any).right, bottom: (shape as any).bottom,
            width: shape.size, height: shape.size,
          }}
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: shape.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4 leading-[1.1]"
        >
          Ready to scale your outreach?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          Join thousands of teams already using MailMind. Start free, upgrade when you grow.
        </motion.p>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
            <motion.button
              type="submit"
              className="w-full sm:w-auto bg-[#1a1a1a] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20 inline-flex items-center gap-2 group whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.form>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 pt-10 border-t border-white/15 flex flex-wrap justify-center gap-6 text-xs text-white/60"
        >
          {[
            { icon: Shield, text: "SOC 2 Compliant" },
            { icon: Globe, text: "99.9% Uptime" },
            { icon: Heart, text: "No credit card required" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.span
                key={item.text}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Icon size={12} />
                {item.text}
              </motion.span>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════════ */

function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-[#fdfbf7] border-t border-gray-200 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <motion.div
                className="w-8 h-8 bg-[#ff5f5f] rounded-xl flex items-center justify-center shadow-sm"
                whileHover={{ rotate: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-white text-xs font-extrabold">M</span>
              </motion.div>
              <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">MailMind</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[200px]">
              AI-powered outreach that actually knows people.
            </p>
          </div>
          {[
            { title: "Product", links: [
              { href: `/${locale}/#features`, label: "Features" },
              { href: `/${locale}/#how-it-works`, label: "How it Works" },
              { href: `/${locale}/pricing`, label: "Pricing" },
            ]},
            { title: "Company", links: [
              { href: "#", label: "About" },
              { href: "#", label: "Blog" },
              { href: "#", label: "Careers" },
            ]},
            { title: "Legal", links: [
              { href: "#", label: "Privacy Policy" },
              { href: "#", label: "Terms of Service" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">{col.title}</p>
              <ul className="space-y-2 text-sm text-gray-500">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[#1a1a1a] transition-colors relative inline-block group/link">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#ff5f5f] transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span>&copy; 2025 MailMind. All rights reserved.</span>
          <div className="flex gap-6">
            {["Twitter/X", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="hover:text-gray-600 transition-colors relative group/social">
                {social}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-400 transition-all duration-300 group-hover/social:w-full" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function PricingPage() {
  const { locale } = useParams()
  const l = locale as string

  return (
    <main className="bg-[#fdfbf7] text-[#1a1a1a] font-sans antialiased selection:bg-[#ff5f5f]/20 selection:text-[#1a1a1a]">
      <Header locale={l} />
      <PricingHero />
      <PricingCards locale={l} />
      <ComparisonTable locale={l} />
      <PricingFAQ />
      <PricingCTA locale={l} />
      <Footer locale={l} />
    </main>
  )
}
