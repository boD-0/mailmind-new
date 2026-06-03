'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Menu, X, ArrowRight, Check, Mail, Sparkles, Globe, Heart, Shield,
  ChevronDown, Crown, Rocket, Loader2, MessageSquare,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from '@/components/I18nProvider'
import { Footer } from "@/components/ui/footer"

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

/* ════════════════════════════════════════════════════════════
   PLAN DATA — matches gatekeeper PLAN_LIMITS
   ════════════════════════════════════════════════════════════ */

interface Tier {
  id: "FREE" | "STARTER" | "PROFESSIONAL"
  tierKey: "free" | "starter" | "professional"
  price: string
  originalPrice?: string
  badge: string | null
  features: { key: string; included: boolean }[]
  ctaHref?: string
  highlight: boolean
}

const TIERS: Tier[] = [
  {
    id: "FREE" as const,
    tierKey: "free" as const,
    price: "$0",
    badge: null,
    features: [
      { key: "vault", included: false },
      { key: "warroom", included: false },
      { key: "twin", included: false },
      { key: "ideas", included: true },
      { key: "aurelius", included: true },
      { key: "basicResearch", included: true },
      { key: "executions", included: true },
    ],
    ctaHref: "sign-up",
    highlight: false,
  },
  {
    id: "STARTER" as const,
    tierKey: "starter" as const,
    price: "$49",
    badge: "MOST POPULAR",
    features: [
      { key: "vault", included: true },
      { key: "warroom", included: false },
      { key: "twin", included: false },
      { key: "ideas", included: true },
      { key: "aurelius", included: true },
      { key: "advResearch", included: true },
      { key: "executions", included: true },
    ],
    highlight: true,
  },
  {
    id: "PROFESSIONAL" as const,
    tierKey: "professional" as const,
    price: "$149",
    badge: null,
    features: [
      { key: "vault", included: true },
      { key: "warroom", included: true },
      { key: "twin", included: true },
      { key: "ideas", included: true },
      { key: "aurelius", included: true },
      { key: "fullResearch", included: true },
      { key: "executions", included: true },
    ],
    highlight: false,
  },
]

const PLAN_DETAILS: Record<string, Record<string, string | boolean>> = {
  FREE: {
    vault: false,
    warroom: false,
    twin: false,
    ideas: true,
    aurelius: true,
    basicResearch: true,
    advResearch: false,
    fullResearch: false,
    executions: "3 / month",
  },
  STARTER: {
    vault: true,
    warroom: false,
    twin: false,
    ideas: true,
    aurelius: true,
    basicResearch: false,
    advResearch: true,
    fullResearch: false,
    executions: "30 / month",
  },
  PROFESSIONAL: {
    vault: true,
    warroom: true,
    twin: true,
    ideas: true,
    aurelius: true,
    basicResearch: false,
    advResearch: false,
    fullResearch: true,
    executions: "Unlimited",
  },
}

const PLAN_EXECUTIONS: Record<string, string> = {
  FREE: "3 / month",
  STARTER: "30 / month",
  PROFESSIONAL: "Unlimited",
}

const COMPARISON_ROWS = [
  { labelKey: "agents", valueKey: "agents" },
  { labelKey: "model", valueKey: "model" },
  { labelKey: "vault", valueKey: "vault" },
  { labelKey: "warroom", valueKey: "warroom" },
  { labelKey: "twin", valueKey: "twin" },
  { labelKey: "ideas", valueKey: "ideas" },
  { labelKey: "aurelius", valueKey: "aurelius" },
  { labelKey: "basic_research", valueKey: "basicResearch" },
  { labelKey: "advanced_research", valueKey: "advResearch" },
  { labelKey: "full_research", valueKey: "fullResearch" },
  { labelKey: "executions", valueKey: "executions" },
]

/* ════════════════════════════════════════════════════════════
   DECORATIVE COMPONENTS
   ════════════════════════════════════════════════════════════ */

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-copper/5 to-purple-300/5 blur-3xl"
        animate={{ x: [0, 40, 0, -30, 0], y: [0, -30, 20, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/5 to-copper/5 blur-3xl"
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
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY, [0, 60],
    ["rgba(12, 12, 10, 0.6)", "rgba(12, 12, 10, 0.9)"]
  )

  return (
    <motion.header
      style={{ backgroundColor: headerBg }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <motion.div
            className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm"
            whileHover={{ rotate: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-white text-xs font-extrabold tracking-tight">M</span>
          </motion.div>
          <span className="font-bold text-lg text-foreground tracking-tight">MailMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href={`/${locale}/#features`} className="relative hover:text-foreground transition-colors group">
            {t('nav.features')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-copper transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#how-it-works`} className="relative hover:text-foreground transition-colors group">
            {t('nav.how_it_works')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-copper transition-all duration-300 group-hover:w-full" />
          </Link>
          <span className="text-foreground font-semibold">{t('nav.pricing')}</span>
          <Link href={`/${locale}/#faq`} className="relative hover:text-foreground transition-colors group">
            {t('nav.faq')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-copper transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <div className="w-px h-5 bg-border" />
          <Link href={`/${locale}/login`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.log_in')}
          </Link>
          <Link href={`/${locale}/sign-up`} className="bg-copper text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all hover:shadow-sm">
            {t('nav.get_started')}
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
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
            <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
              <Link href={`/${locale}/#features`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors">{t('nav.features')}</Link>
              <Link href={`/${locale}/#how-it-works`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors">{t('nav.how_it_works')}</Link>
              <span className="text-sm text-foreground font-semibold px-3 py-2">{t('nav.pricing')}</span>
              <Link href={`/${locale}/#faq`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors">{t('nav.faq')}</Link>
              <motion.div variants={fadeUp} className="flex items-center justify-between pb-2 border-b border-border/30">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('nav.language')}</span>
                <LanguageSwitcher />
              </motion.div>
              <div className="flex gap-3 pt-2 mt-2 border-t border-border/30">
                <Link href={`/${locale}/login`} className="flex-1 text-center text-sm font-medium text-muted-foreground px-4 py-2.5 border border-border rounded-full hover:border-copper/30 transition-colors">{t('nav.log_in')}</Link>
                <Link href={`/${locale}/sign-up`} className="flex-1 text-center bg-copper text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-colors">{t('nav.get_started')}</Link>
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
  const { t } = useTranslation()
  return (
    <section className="relative pt-28 pb-16 px-6 text-center bg-background overflow-hidden">
      <FloatingOrbs />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.span
            className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={12} />
            {t('pricing.hero.badge')}
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-foreground"
        >
          {t('pricing.hero.title_1')}{" "}            <span className="text-copper">
              {t('pricing.hero.title_highlight')}
            </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          {t('pricing.hero.subtitle')}
        </motion.p>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   PRICING CARDS
   ════════════════════════════════════════════════════════════ */

function PricingCards({ locale }: { locale: string }) {
  const { t } = useTranslation()
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)

  const posthog = usePostHog()

  const handleCheckout = async (plan: string) => {
    setCheckoutPlan(plan)
    posthog.capture('checkout_started', { plan, billing })
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (res.status === 401) {
        // Not logged in — redirect to sign-up with plan hint
        window.location.href = `/${locale}/sign-up`
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("[Pricing] Checkout error:", err);
    } finally {
      setCheckoutPlan(null)
    }
  }

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

  const getTierName = (tierKey: string) => {
    return t(`pricing.tier_${tierKey}.name`)
  }

  const getTierDesc = (tierKey: string) => {
    return t(`pricing.tier_${tierKey}.description`)
  }

  const getTierCta = (tierKey: string) => {
    return t(`pricing.tier_${tierKey}.cta`)
  }

  const getFeatureLabel = (key: string) => {
    return t(`pricing.features.${key}`)
  }

  return (
    <section className="relative pb-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-semibold transition-all duration-300 ${billing === "monthly" ? "text-foreground scale-105" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t('pricing.toggle_monthly')}
          </button>
          <motion.button
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${billing === "annual" ? "bg-primary shadow-sm" : "bg-muted"}`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
              animate={{ x: billing === "annual" ? 34 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {billing === "annual" && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="text-xs"
                >
                  <Check size={10} />
                </motion.span>
              )}
            </motion.span>
          </motion.button>
          <button
            onClick={() => setBilling("annual")}
            className={`text-sm font-semibold transition-all duration-300 relative ${billing === "annual" ? "text-foreground scale-105" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t('pricing.toggle_yearly')}
            <motion.span
              className="ml-2 text-[10px] text-white font-bold bg-emerald-500 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
              animate={{ scale: billing === "annual" ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={10} />
              {t('pricing.yearly_save')}
            </motion.span>
          </button>
        </motion.div>

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
              className={`rounded-2xl p-8 border bg-card relative flex flex-col transition-all duration-500 ${
                tier.highlight
                  ? "border-primary border-2 shadow-md scale-[1.01]"
                  : "border-border shadow-sm hover:border-copper/30"
              }`}
              whileHover={{
                y: tier.highlight ? -10 : -6,
                boxShadow: tier.highlight
                  ? "0 24px 48px rgba(193,123,63,0.15)"
                  : "0 12px 30px rgba(0,0,0,0.3)",
                transition: { duration: 0.3 },
              }}
            >
              {tier.badge && (
                <motion.span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                >
                  <motion.span
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-sm"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Crown size={11} />
                    {tier.badge}
                  </motion.span>
                </motion.span>
              )}

              <div className={`${tier.highlight ? "mt-2" : ""}`}>
                <h3 className="font-bold text-lg text-foreground">{getTierName(tier.tierKey)}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{getTierDesc(tier.tierKey)}</p>
              </div>

              <div className="flex items-baseline gap-1 my-6">
                {tier.originalPrice && (
                  <span className="text-2xl text-muted-foreground/30 line-through font-semibold tracking-tighter mr-0.5">
                    {tier.originalPrice}
                  </span>
                )}
                <motion.span
                  className="text-5xl font-extrabold tracking-tighter text-foreground"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                  key={billing}
                >
                  {getPrice(tier.price, tier.id)}
                </motion.span>
                <span className="text-muted-foreground text-sm">{getPeriod(tier.id)}</span>
                {tier.originalPrice && billing === "annual" && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {t('pricing.yearly_save')}
                  </span>
                )}
              </div>

              {/* Agent & Model */}
              <ul className="space-y-3 mb-8 flex-1">
                <motion.li
                  className="flex items-center gap-2.5 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <div className="w-5 h-5 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-copper" />
                  </div>
                  <span className="text-muted-foreground">{t('pricing.features.agents')}: {tier.id === "FREE" ? t('pricing.features.agent_1') : tier.id === "STARTER" ? t('pricing.features.agent_2') : t('pricing.features.agent_4')}</span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-2.5 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                >
                  <div className="w-5 h-5 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-copper" />
                  </div>
                  <span className="text-muted-foreground">{t('pricing.features.model')}: {tier.id === "FREE" ? t('pricing.features.model_mini') : t('pricing.features.model_full')}</span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-2.5 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                >
                  <div className="w-5 h-5 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-copper" />
                  </div>
                  <span className="text-muted-foreground">{t('pricing.features.executions')}: {PLAN_EXECUTIONS[tier.id]}</span>
                </motion.li>
                {tier.features.map((f) => (
                  <motion.li
                    key={f.key}
                    className="flex items-center gap-2.5 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                  >
                    {f.included ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <X size={11} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <span className={f.included ? "text-muted-foreground" : "text-muted-foreground/50"}>
                      {getFeatureLabel(f.key)}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {tier.id === "FREE" ? (
                <Link
                  href={`/${locale}/sign-up`}
                  className="w-full py-3.5 rounded-full font-semibold text-sm text-center transition-all inline-flex items-center justify-center gap-2 group border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                >
                  {getTierCta(tier.tierKey)}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(tier.id)}
                  disabled={checkoutPlan === tier.id}
                  className={`w-full py-3.5 rounded-full font-semibold text-sm text-center transition-all inline-flex items-center justify-center gap-2 group ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-primary text-primary-foreground hover:bg-primary-hover"
                  } ${checkoutPlan === tier.id ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {checkoutPlan === tier.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {getTierCta(tier.tierKey)}
                      <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </>
                  )}
                </button>
              )}
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
  const { t } = useTranslation()

  return (
    <section className="relative py-24 px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-4 py-1.5 rounded-full bg-muted/50 border border-border">
            {t('pricing.comparison.label')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4">
            {t('pricing.comparison.title_1')}{" "}
            <span className="text-copper">
              {t('pricing.comparison.title_highlight')}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {t('pricing.comparison.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block overflow-hidden rounded-2xl border border-border shadow-sm"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground w-1/3">
                  {t('pricing.features.agents')}
                </th>
                {TIERS.map((tier) => (
                  <th key={tier.id} className={`text-center px-6 py-4 text-sm font-bold ${tier.highlight ? "text-copper" : "text-foreground"}`}>
                    {t(`pricing.tier_${tier.tierKey}.name`)}
                    {tier.highlight && (
                      <span className="ml-2 text-[10px] bg-copper/10 text-copper px-2 py-0.5 rounded-full">
                        {tier.badge}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <motion.tr
                  key={row.labelKey}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className={`border-b border-border/30 ${i % 2 === 0 ? "bg-card" : "bg-muted/30"} hover:bg-muted/50 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{t(`pricing.features.${row.labelKey}`)}</td>
                  {TIERS.map((tier) => {
                    const val = PLAN_DETAILS[tier.id]![row.valueKey]
                    return (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {val === true ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto">
                            <Check size={13} className="text-emerald-400" />
                          </div>
                        ) : val === false ? (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <X size={13} className="text-muted-foreground/30" />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground font-medium">{String(val)}</span>
                        )}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
              {/* Agent count & model rows */}
              {["agents", "model"].map((key, i) => (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * (COMPARISON_ROWS.length + i), duration: 0.3 }}
                  className={`border-b border-border/30 ${(COMPARISON_ROWS.length + i) % 2 === 0 ? "bg-card" : "bg-muted/50"} hover:bg-muted/50 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{t(`pricing.features.${key}`)}</td>
                  {TIERS.map((tier) => {
                    const val = key === "agents"
                      ? tier.id === "FREE" ? t('pricing.features.agent_1') : tier.id === "STARTER" ? t('pricing.features.agent_2') : t('pricing.features.agent_4')
                      : tier.id === "FREE" ? t('pricing.features.model_mini') : t('pricing.features.model_full')
                    return (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        <span className="text-sm text-muted-foreground">{val}</span>
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="md:hidden space-y-4">
          {COMPARISON_ROWS.map((feat) => (
            <motion.div
              key={feat.labelKey}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-border rounded-xl p-4 bg-card shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground mb-3">{t(`pricing.features.${feat.labelKey}`)}</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((tier) => {
                  const val = PLAN_DETAILS[tier.id]![feat.valueKey]
                  return (
                    <div key={tier.id} className="text-center">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">{t(`pricing.tier_${tier.tierKey}.name`)}</span>
                      {val === true ? (
                        <Check size={14} className="text-emerald-500 mx-auto" />
                      ) : val === false ? (
                        <X size={14} className="text-muted-foreground/30 mx-auto" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{String(val)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
          {/* Agent count & model for mobile */}
          {["agents", "model"].map((key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-border rounded-xl p-4 bg-card shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground mb-3">{t(`pricing.features.${key}`)}</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((tier) => {
                  const val = key === "agents"
                    ? tier.id === "FREE" ? t('pricing.features.agent_1') : tier.id === "STARTER" ? t('pricing.features.agent_2') : t('pricing.features.agent_4')
                    : tier.id === "FREE" ? t('pricing.features.model_mini') : t('pricing.features.model_full')
                  return (
                    <div key={tier.id} className="text-center">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">{t(`pricing.tier_${tier.tierKey}.name`)}</span>
                      <span className="text-xs text-muted-foreground">{val}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href={`/${locale}/sign-up`}
            className="inline-flex items-center gap-2 bg-copper text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:opacity-90 transition-all hover:shadow-sm group"
          >
            {t('pricing.features.cta_start')}
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

const FAQ_ITEMS = [
  { qKey: "q1", aKey: "a1" },
  { qKey: "q2", aKey: "a2" },
  { qKey: "q3", aKey: "a3" },
  { qKey: "q4", aKey: "a4" },
  { qKey: "q5", aKey: "a5" },
  { qKey: "q6", aKey: "a6" },
]

function PricingFAQ() {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4">
            {t('pricing.faq.title_1')}{" "}
            <span className="text-copper">
              {t('pricing.faq.title_highlight')}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('pricing.faq.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-3"
        >
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i * 0.05}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenId(openId === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground pr-4">{t(`pricing.faq.${item.qKey}`)}</span>
                <motion.div
                  animate={{ rotate: openId === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={16} className="text-muted-foreground" />
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
                    <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {t(`pricing.faq.${item.aKey}`)}
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

const TRUST_ITEMS = [
  { icon: Shield, textKey: "cta.trust_soc2" },
  { icon: Globe, textKey: "cta.trust_uptime" },
  { icon: Heart, textKey: "cta.trust_nocc" },
]

function PricingCTA({ locale }: { locale: string }) {
  const { t } = useTranslation()
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
    <section className="relative bg-primary py-24 px-6 text-center overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {[
        { top: "5%", left: "5%", size: 70, delay: 0 },
        { top: "15%", right: "10%", size: 50, delay: 0.8 },
        { top: "60%", right: "8%", size: 55, delay: 1.5 },
        { bottom: "20%", left: "8%", size: 65, delay: 2.2 },
        { top: "40%", left: "15%", size: 45, delay: 1 },
        { bottom: "30%", right: "20%", size: 40, delay: 2.8 },
      ].map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            top: shape.top, left: shape.left,
            right: (shape as any).right, bottom: (shape as any).bottom,
            width: shape.size, height: shape.size,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5 + i * 0.5,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
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
          {t('pricing.cta.title')}
          <motion.span
            className="inline-block ml-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Rocket size={24} className="inline" />
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          {t('pricing.cta.subtitle')}
        </motion.p>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto px-6 py-4 rounded-full bg-white/15 text-white text-sm font-medium"
          >
            {t('pricing.cta.success')}
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
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('pricing.cta.placeholder')}
                required
                className="w-full pl-11 pr-5 py-3.5 rounded-full text-sm outline-none text-foreground placeholder:text-muted-foreground bg-card border-0 focus:ring-2 focus:ring-white/30 transition-shadow"
              />
            </div>
            <motion.button
              type="submit"
              className="w-full sm:w-auto bg-foreground text-background px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-black/20 inline-flex items-center gap-2 group whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {t('pricing.cta.button')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.form>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 pt-10 border-t border-white/20 flex flex-wrap justify-center gap-8 text-sm text-white/80 font-medium"
        >
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.span
                key={item.textKey}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                >
                  <Icon size={14} />
                </motion.span>
                {t(`home.${item.textKey}`)}
              </motion.span>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   AURELIUS CLOSE SECTION
   ════════════════════════════════════════════════════════════ */

function AureliusClose({ locale }: { locale: string }) {
  const { t } = useTranslation()

  return (
    <section className="relative py-24 px-6 bg-amber-50 dark:bg-[#2C1A00] overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-700 dark:text-amber-300 text-sm font-bold">Au</span>
          </div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-4">Aurelius</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xl md:text-2xl font-medium text-amber-900 dark:text-amber-100 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          {t('pricing.aurelius_close.message')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Link
            href={`/${locale}/dashboard/chat?context=help-me-choose-a-plan`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-copper text-white text-sm font-bold rounded-xl hover:bg-copper/80 transition-all group"
          >
            <MessageSquare size={16} />
            {t('pricing.aurelius_close.cta')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════════ */

const FOOTER_COLUMNS = [
  {
    titleKey: "footer.product",
    links: [
      { href: (locale: string) => `/${locale}/#features`, labelKey: "footer.product_features" },
      { href: (locale: string) => `/${locale}/#how-it-works`, labelKey: "footer.product_how" },
      { href: (locale: string) => `/${locale}/pricing`, labelKey: "footer.product_pricing" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { href: "#", labelKey: "footer.company_about" },
      { href: "#", labelKey: "footer.company_blog" },
      { href: "#", labelKey: "footer.company_careers" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { href: "#", labelKey: "footer.legal_privacy" },
      { href: "#", labelKey: "footer.legal_terms" },
    ],
  },
]

const SOCIAL_LINKS = ["footer.social_twitter", "footer.social_linkedin", "footer.social_github"]

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function PricingPage() {
  const { locale } = useParams()
  const l = locale as string
  const posthog = usePostHog()

  useEffect(() => {
    posthog?.capture('pricing_viewed')
  }, [posthog])

  return (
    <main className="bg-background text-foreground font-sans antialiased selection:bg-copper/20 selection:text-foreground">
      <Header locale={l} />
      <PricingHero />
      <PricingCards locale={l} />
      <ComparisonTable locale={l} />
      <PricingFAQ />
      <PricingCTA locale={l} />
      <AureliusClose locale={l} />
      <Footer locale={l} columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </main>
  )
}
