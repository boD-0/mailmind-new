'use client'

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from "framer-motion"
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
  Send, Mail, Sparkles,
  Zap, Crown, Shield, CreditCard,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from '@/components/I18nProvider'
import { Hero } from "@/components/ui/animated-hero"
import { Footer } from "@/components/ui/footer"
import DemoVideoSection from "@/components/ui/demo-video-section"
import TestimonialsSection from "@/components/ui/testimonials-section"

/* ════════════════════════════════════════════════════════════
   ANIMATION VARIANT PRESETS
   ════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
}

const fadeUpScale: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
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
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const specialists = [
  {
    name: "The Researcher",
    tKey: 'home.features.researcher.name',
    descKey: 'home.features.researcher.description',
    icon: Search,
    bg: "bg-emerald-100",
    iconBg: "bg-emerald-200 text-emerald-700",
    border: "border-emerald-200",
    accent: "emerald",
  },
  {
    name: "The Psychologist",
    tKey: 'home.features.psychologist.name',
    descKey: 'home.features.psychologist.description',
    icon: Brain,
    bg: "bg-amber-100",
    iconBg: "bg-amber-200 text-amber-700",
    border: "border-amber-200",
    accent: "amber",
  },
  {
    name: "The Strategist",
    tKey: 'home.features.strategist.name',
    descKey: 'home.features.strategist.description',
    icon: Target,
    bg: "bg-indigo-100",
    iconBg: "bg-indigo-200 text-indigo-700",
    border: "border-indigo-200",
    accent: "indigo",
  },
  {
    name: "The Copywriter",
    tKey: 'home.features.copywriter.name',
    descKey: 'home.features.copywriter.description',
    icon: PenTool,
    bg: "bg-rose-100",
    iconBg: "bg-rose-200 text-rose-700",
    border: "border-rose-200",
    accent: "rose",
  },
]

const demoSteps = [
  { icon: Search, label: "Research", labelKey: 'home.demo.step_research', descKey: 'home.demo.desc_research', color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { icon: Brain, label: "Profile", labelKey: 'home.demo.step_profile', descKey: 'home.demo.desc_profile', color: "bg-amber-100 text-amber-600 border-amber-200" },
  { icon: Target, label: "Strategy", labelKey: 'home.demo.step_strategy', descKey: 'home.demo.desc_strategy', color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { icon: PenTool, label: "Write", labelKey: 'home.demo.step_copy', descKey: 'home.demo.desc_write', color: "bg-rose-100 text-rose-600 border-rose-200" },
  { icon: Send, label: "Send", labelKey: 'home.demo.step_send', descKey: 'home.demo.desc_send', color: "bg-purple-100 text-purple-600 border-purple-200" },
]

const plans = [
  {
    nameKey: 'home.pricing.free.name',
    price: "$0",
    period: '/month',
    periodKey: 'home.pricing.free.period',
    badge: null,
    features: [
      'home.pricing.free.features.0',
      'home.pricing.free.features.1',
      'home.pricing.free.features.2',
      'home.pricing.free.features.3',
    ],
    ctaKey: 'home.pricing.free.cta',
    highlight: false,
  },
  {
    nameKey: 'home.pricing.starter.name',
    price: "$49",
    period: '/month',
    periodKey: 'home.pricing.starter.period',
    badge: 'MOST POPULAR',
    badgeKey: 'home.pricing.starter.badge',
    features: [
      'home.pricing.starter.features.0',
      'home.pricing.starter.features.1',
      'home.pricing.starter.features.2',
      'home.pricing.starter.features.3',
      'home.pricing.starter.features.4',
    ],
    ctaKey: 'home.pricing.starter.cta',
    highlight: true,
  },
  {
    nameKey: 'home.pricing.professional.name',
    price: "$149",
    period: '/month',
    periodKey: 'home.pricing.professional.period',
    badge: null,
    features: [
      'home.pricing.professional.features.0',
      'home.pricing.professional.features.1',
      'home.pricing.professional.features.2',
      'home.pricing.professional.features.3',
      'home.pricing.professional.features.4',
    ],
    ctaKey: 'home.pricing.professional.cta',
    highlight: false,
  },
]

const faqs = [
  { qKey: 'home.faq.q1', aKey: 'home.faq.a1' },
  { qKey: 'home.faq.q2', aKey: 'home.faq.a2' },
  { qKey: 'home.faq.q3', aKey: 'home.faq.a3' },
  { qKey: 'home.faq.q4', aKey: 'home.faq.a4' },
  { qKey: 'home.faq.q5', aKey: 'home.faq.a5' },
  { qKey: 'home.faq.q6', aKey: 'home.faq.a6' },
]

/* ════════════════════════════════════════════════════════════
   DECORATIVE COMPONENTS
   ════════════════════════════════════════════════════════════ */

/** Floating geometric orbs in the background */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1 */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-copper/5 to-purple-300/5 blur-3xl"
        animate={{
          x: [0, 40, 0, -30, 0],
          y: [0, -30, 20, 10, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 2 */}
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/5 to-copper/5 blur-3xl"
        animate={{
          x: [0, -50, 20, 30, 0],
          y: [0, 30, -20, -10, 0],
          scale: [1, 0.9, 1.05, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 3 */}
      <motion.div
        className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/5 to-rose-200/5 blur-3xl"
        animate={{
          x: [0, 30, -20, 10, 0],
          y: [0, -20, 30, -10, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/** Animated section heading */
function SectionHeading({
  label,
  title,
  highlight,
  description,
}: {
  label: string
  title: string
  highlight: string
  description: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className="text-center mb-16"
    >
      <motion.span
        variants={fadeUp}
        className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-4 py-1.5 rounded-full bg-muted/50 border border-border"
      >
        {label}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4"
      >
        {title}{" "}          <span className="text-copper">
            {highlight}
          </span>
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ── 1. HEADER ── */

function Header({ locale }: { locale: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY,
    [0, 60],
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
          <Link href={`/${locale}/pricing`} className="relative hover:text-foreground transition-colors group">
            {t('nav.pricing')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-copper transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#faq`} className="relative hover:text-foreground transition-colors group">
            {t('nav.faq')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-copper transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <div className="w-px h-5 bg-border" />
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('nav.log_in')}
          </Link>
          <Link
            href={`/${locale}/sign-up`}
            className="bg-copper text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all hover:shadow-sm relative overflow-hidden group"
          >
            <span className="relative z-10">{t('nav.get_started')}</span>

          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle navigation"
        >
          <motion.div
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2"
            >
                <motion.a variants={fadeUp} href={`/${locale}/#features`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.features')}</motion.a>
                <motion.a variants={fadeUp} href={`/${locale}/#how-it-works`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.how_it_works')}</motion.a>
                <Link href={`/${locale}/pricing`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.pricing')}</Link>
                <motion.a variants={fadeUp} href={`/${locale}/#faq`} className="text-sm text-muted-foreground px-3 py-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.faq')}</motion.a>
              <motion.div
                variants={fadeUp}
                className="flex items-center justify-between pb-2 border-b border-border/30"
              >
                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t('nav.language')}</span>
                <LanguageSwitcher />
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex gap-3 pt-2 mt-2 border-t border-border/30"
              >
                <Link
                  href={`/${locale}/login`}
                  className="flex-1 text-center text-sm font-medium text-muted-foreground px-4 py-2.5 border border-border rounded-full hover:border-copper/30 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.log_in')}
                </Link>
                <Link
                  href={`/${locale}/sign-up`}
                  className="flex-1 text-center bg-copper text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.get_started')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ── 2. FEATURES — 4 SPECIALISTS ── */

function FeaturesSection() {
  const { t } = useTranslation()
  const cardBgs = ["bg-emerald-950/20", "bg-amber-950/20", "bg-indigo-950/20", "bg-rose-950/20"]

  return (
    <section id="features" className="relative py-24 px-6 bg-obsidian-light overflow-hidden">
      <FloatingOrbs />
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label={t('home.features.label')}
          title={t('home.features.title')}
          highlight={t('home.features.highlight')}
          description={t('home.features.description')}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {specialists.map((specialist, i) => {
            const Icon = specialist.icon
            return (
              <motion.div
                key={specialist.name}
                variants={fadeUpScale}
                custom={i * 0.08}
                className={`border ${specialist.border} rounded-2xl shadow-sm ${cardBgs[i]} p-6 cursor-default relative overflow-hidden group`}
                whileHover={{
                  y: -6,
                  boxShadow: `0 12px 30px rgba(0,0,0,0.3)`,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Hover glow */}
                <motion.div
                  className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  style={{
                    background: `radial-gradient(400px at 50% 50%, ${specialist.accent === "emerald" ? "rgba(52,211,153,0.06)" : specialist.accent === "amber" ? "rgba(251,191,36,0.06)" : specialist.accent === "indigo" ? "rgba(99,102,241,0.06)" : "rgba(244,63,94,0.06)"}, transparent)`,
                  }}
                />
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <motion.div
                    className={`w-12 h-12 rounded-xl ${specialist.iconBg} flex items-center justify-center shrink-0`}
                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={22} />
                  </motion.div>
                  <div>                      <motion.span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${specialist.iconBg}`}
                      >
                        {t(specialist.tKey)}
                      </motion.span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base relative z-10">
                  {t(specialist.descKey)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ── 4. INTERACTIVE DEMO ── */

function InteractiveDemoSection() {
  const { t } = useTranslation()
  const demoStepLabels = [t('home.demo.step_research'), t('home.demo.step_profile'), t('home.demo.step_strategy'), t('home.demo.step_copy'), t('home.demo.step_send')]

  return (
    <section id="how-it-works" className="relative py-24 px-6 bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label={t('home.demo.label')}
          title={t('home.demo.title')}
          highlight={t('home.demo.highlight')}
          description={t('home.demo.description')}
        />

        {/* Step labels */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="hidden md:flex items-center justify-between mb-4 px-2"
        >
          {demoStepLabels.map((label, i) => (
            <motion.span
              key={label}
              variants={fadeUp}
              custom={i * 0.05}
              className="text-xs font-semibold text-muted-foreground tracking-wider uppercase"
            >
              {i + 1}. {label}
            </motion.span>
          ))}
        </motion.div>

        {/* Animated Progress line */}
        <div className="hidden md:block relative h-0.5 bg-border rounded-full mb-8 mx-2 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-400 via-indigo-400 to-rose-400 rounded-full"
            initial={{ width: "0%" }}
            whileInView={{ width: "80%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
          {[16, 32, 48, 64, 80].map((left, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-obsidian border-2 z-10"
              style={{
                left: `calc(${left}% - 6px)`,
                borderColor: ["#34d399", "#fbbf24", "#6366f1", "#f43f5e", "#a855f7"][i],
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: ["#34d399", "#fbbf24", "#6366f1", "#f43f5e", "#a855f7"][i] }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
            </motion.div>
          ))}
        </div>

        {/* 5 Horizontal colored cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4"
        >
          {demoSteps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                variants={fadeUpScale}
                custom={i * 0.08}
                className={`${step.color} border rounded-xl p-4 md:p-5 flex flex-col items-center text-center gap-3 cursor-default relative overflow-hidden`}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon size={20} />
                </motion.div>
                <span className="text-xs font-bold tracking-wide">{t(step.labelKey)}</span>
                <motion.span
                  className="text-[10px] text-muted-foreground font-medium hidden md:block"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  {t(step.descKey)}
                </motion.span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Mobile friendly description */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center md:hidden"
        >
          <p className="text-xs text-muted-foreground">
            {t('home.demo.mobile_flow')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 5. DIFFERENTIATION ── */

function DifferentiationSection() {
  const { t } = useTranslation()
  const diffItems = [
    t('home.differentiation.items.0'),
    t('home.differentiation.items.1'),
    t('home.differentiation.items.2'),
    t('home.differentiation.items.3'),
  ]

  return (
    <section className="relative py-24 px-6 bg-obsidian-light overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-4 py-1.5 rounded-full bg-muted/50 border border-border">
            {t('home.differentiation.label')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-6 leading-[1.1]">
            {t('home.differentiation.title_1')}{" "}
            <span className="line-through text-muted-foreground/50">{t('home.differentiation.title_strikethrough')}</span>
            <br />
            {t('home.differentiation.title_2')}{" "}
            <span className="text-copper">
              {t('home.differentiation.title_highlight')}
            </span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {t('home.differentiation.description')}
          </p>
          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {diffItems.map((item) => (
              <motion.li
                key={item}
                variants={fadeUp}
                custom={0.1}
                className="flex items-start gap-3 text-muted-foreground text-sm group"
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5"
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(52,211,153,0.3)" }}
                >
                  <Check size={12} className="text-emerald-600" />
                </motion.div>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right: OCEAN Radar Chart */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex items-center justify-center"
        >
          <motion.div
            className="w-full max-w-sm bg-obsidian-mid rounded-2xl border border-border p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}
            transition={{ duration: 0.3 }}
          >
            {/* OCEAN Radar Chart SVG */}
            <svg viewBox="0 0 240 240" className="w-full h-auto">
              {/* Grid pentagon — draw with stroke-dasharray animation */}
              <motion.polygon
                points="120,20 212,80 212,170 120,220 28,170 28,80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
                initial={{ strokeDasharray: 800, strokeDashoffset: 800 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.polygon
                points="120,55 189,100 189,155 120,190 51,155 51,100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
                initial={{ strokeDasharray: 600, strokeDashoffset: 600 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.polygon
                points="120,90 166,120 166,150 120,160 74,150 74,120"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
                initial={{ strokeDasharray: 400, strokeDashoffset: 400 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
              />

              {/* Data fill */}
              <motion.polygon
                points="120,35 195,100 185,175 120,195 55,175 45,100"
                fill="#c17b3f"
                fillOpacity="0.12"
                stroke="#c17b3f"
                strokeWidth="2"
                initial={{ scale: 0, transformOrigin: "120px 120px" }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              >
                <animate
                  attributeName="fillOpacity"
                  values="0;0.12;0.08;0.12"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </motion.polygon>

              {/* Data points */}
              {[
                { cx: 120, cy: 35, delay: 0.7 },
                { cx: 195, cy: 100, delay: 0.8 },
                { cx: 185, cy: 175, delay: 0.9 },
                { cx: 120, cy: 195, delay: 1.0 },
                { cx: 55, cy: 175, delay: 1.1 },
                { cx: 45, cy: 100, delay: 1.2 },
              ].map((pt) => (
                <motion.circle
                  key={`${pt.cx}-${pt.cy}`}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="3"
                  fill="#c17b3f"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: pt.delay, type: "spring", stiffness: 500, damping: 10 }}
                >
                  <animate
                    attributeName="r"
                    values="3;4.5;3"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${pt.delay}s`}
                  />
                </motion.circle>
              ))}

              {/* Labels */}
              {[
                { x: 120, y: 14, text: "Openness" },
                { x: 222, y: 104, text: "Extraversion" },
                { x: 210, y: 190, text: "Consc." },
                { x: 120, y: 233, text: "Agree." },
                { x: 18, y: 190, text: "Neurot." },
                { x: 28, y: 104, text: "Extra." },
              ].map((label) => (
                <motion.text
                  key={label.text}
                  x={label.x}
                  y={label.y}
                  textAnchor={label.x < 40 ? "end" : label.x > 200 ? "start" : "middle"}
                  className="text-[8px] font-bold"
                  fill="currentColor"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.3 }}
                >
                  {label.text}
                </motion.text>
              ))}
            </svg>

            <motion.div
              className="mt-4 pt-4 border-t border-border/30"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4 }}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t('home.differentiation.ocean_profile')}</span>
                <motion.span
                  className="flex items-center gap-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-2 h-2 rounded-full bg-copper" />
                  {t('home.differentiation.digital_twin')}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 6. PRICING ── */

function PricingSection() {
  const { t } = useTranslation()
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")

  return (
    <section id="pricing" className="relative py-24 px-6 bg-background overflow-hidden">
      {/* Cartoonish floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[
          { w: 42, h: 38, left: "10%", top: "12%", bg: "rgba(193,123,63,0.08)", delay: 0 },
          { w: 55, h: 48, left: "26%", top: "28%", bg: "rgba(193,123,63,0.06)", delay: 0.5 },
          { w: 36, h: 40, left: "42%", top: "8%", bg: "rgba(193,123,63,0.05)", delay: 1.0 },
          { w: 60, h: 52, left: "58%", top: "25%", bg: "rgba(168,85,247,0.06)", delay: 1.5 },
          { w: 44, h: 35, left: "74%", top: "18%", bg: "rgba(193,123,63,0.07)", delay: 2.0 },
          { w: 50, h: 45, left: "90%", top: "32%", bg: "rgba(168,85,247,0.05)", delay: 2.5 },
        ].map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: shape.w,
              height: shape.h,
              left: shape.left,
              top: shape.top,
              background: shape.bg,
              opacity: 0.5,
            }}              animate={{
                y: [0, -15 - i * 3, 0],
                rotate: [0, i % 2 === 0 ? 20 : -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: shape.delay,
              }}
          />
        ))}
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label={t('home.pricing.label')}
          title={t('home.pricing.title')}
          highlight={t('home.pricing.highlight')}
          description={t('home.pricing.description')}
        />

        {/* ── Monthly/Annual Toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
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
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((plan, i) => {
            const isAnnual = billing === "annual"
            const basePrice = parseInt(plan.price.replace("$", ""))
            const displayPrice = isAnnual && basePrice > 0 ? `$${Math.round(basePrice * 10)}` : plan.price
            const displayPeriod = isAnnual && basePrice > 0 ? "/year" : plan.period
            return (
            <motion.div
              key={plan.nameKey}
              variants={fadeUpScale}
              custom={i * 0.1}
              className={`rounded-2xl p-8 border bg-card relative flex flex-col transition-all duration-500 ${
                plan.highlight
                  ? "border-primary border-2 shadow-lg shadow-primary/10 scale-[1.01]"
                  : "border-border shadow-sm hover:border-copper/30"
              }`}
              whileHover={{
                y: plan.highlight ? -10 : -6,
                boxShadow: plan.highlight
                  ? "0 24px 48px rgba(193,123,63,0.15)"
                  : "0 12px 30px rgba(0,0,0,0.3)",
                transition: { duration: 0.3 },
              }}
            >
              {plan.badge && (
                <motion.span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                >
                  <motion.span
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-sm"
                    initial={{ y: -10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Crown size={11} />
                    {plan.badge}
                  </motion.span>
                </motion.span>
              )}
              <h3 className={`font-bold text-lg mb-1 text-foreground ${plan.highlight ? "mt-2" : ""}`}>
                {t(plan.nameKey)}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <motion.span
                  className={`text-4xl font-extrabold tracking-tighter ${plan.highlight ? "text-primary" : "text-foreground"}`}
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                  key={`${billing}-${plan.nameKey}`}
                >
                  {displayPrice}
                </motion.span>
                <span className="text-muted-foreground text-sm">{displayPeriod}</span>
                {isAnnual && basePrice > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full"
                  >
                    -17%
                  </motion.span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((fKey) => (
                  <motion.li
                    key={fKey}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <Check size={12} className="text-emerald-500" />
                    </motion.div>
                    <span>{t(fKey)}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border text-muted-foreground hover:border-copper/50 hover:text-foreground"
                }`}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(plan.ctaKey)}
              </motion.button>
            </motion.div>
          )})}
        </motion.div>
      </div>
    </section>
  )
}

/* ── 7. FAQ ── */

function FAQSection() {
  const { t } = useTranslation()
  return (
    <section id="faq" className="relative py-24 px-6 bg-obsidian-light overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center text-foreground"
        >
          {t('home.faq.title')}{" "}
          <span className="text-copper">
            {t('home.faq.title_highlight')}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground text-center mb-12"
        >
          {t('home.faq.subtitle')}
        </motion.p>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >              <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.05}
              >
                <AccordionItem value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline group">
                    <span className="flex items-center gap-3">
                      <motion.span
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-copper/10 transition-colors"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Zap size={10} className="text-muted-foreground group-hover:text-copper transition-colors" />
                      </motion.span>
                      {t(item.qKey)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-9">
                    {t(item.aKey)}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 8. FINAL CTA ── */

function FinalCTASection() {
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
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />



      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <motion.span
            className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold tracking-wider px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={12} className="text-yellow-300" />
            FREE FOREVER PLAN
          </motion.span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-4 leading-[1.1]"
        >
          {t('home.cta.title')}{" "}
          <motion.span
            className="italic inline-block"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('home.cta.title_highlight')}
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          {t('home.cta.subtitle')}
        </motion.p>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium border border-white/30"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('home.cta.success')}
            </motion.span>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <motion.div
              className="relative flex-1 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.cta.placeholder')}
                required
                className="w-full pl-11 pr-5 py-4 rounded-full text-sm outline-none text-foreground placeholder:text-muted-foreground bg-card border border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </motion.div>
            <motion.button
              type="submit"
              className="w-full sm:w-auto bg-foreground text-background px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 group whitespace-nowrap"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('home.cta.button')}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </motion.button>
          </motion.form>
        )}

        <div className="mt-10 pt-10 border-t border-white/20 flex flex-wrap justify-center gap-8 text-sm text-white/80 font-medium">
          <span className="flex items-center gap-2">
            <Shield size={14} />
            {t('home.cta.trust_soc2')}
          </span>
          <span className="flex items-center gap-2">
            <Zap size={14} />
            {t('home.cta.trust_uptime')}
          </span>
          <span className="flex items-center gap-2">
            <CreditCard size={14} />
            {t('home.cta.trust_nocc')}
          </span>
        </div>
      </div>
    </section>
  )
}

/* ── 9. FOOTER ── */

const LANDING_FOOTER_COLUMNS = [
  {
    titleKey: "footer.product",
    links: [
      { href: (locale: string) => `/${locale}/#features`, labelKey: "footer.product_features" },
      { href: (locale: string) => `/${locale}/#how-it-works`, labelKey: "footer.product_how" },
      { href: (locale: string) => `/${locale}/#pricing`, labelKey: "footer.product_pricing" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { href: (locale: string) => `/${locale}/about`, labelKey: "footer.company_about" },
      { href: (locale: string) => `/${locale}/blog`, labelKey: "footer.company_blog" },
      { href: "#", labelKey: "footer.company_careers" },
    ],
  },
  {
    titleKey: "footer.legal",
    links: [
      { href: (locale: string) => `/${locale}/privacy`, labelKey: "footer.legal_privacy" },
      { href: (locale: string) => `/${locale}/terms`, labelKey: "footer.legal_terms" },
    ],
  },
]

const LANDING_SOCIAL_LINKS = ["footer.social_twitter", "footer.social_linkedin", "footer.social_github"]

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { locale } = useParams()
  const l = locale as string

  return (
    <main className="bg-background text-foreground font-sans antialiased selection:bg-copper/20 selection:text-foreground">
      {/* ── Copper streak accent ── */}
      <div className="copper-streak" />
      <Header locale={l} />
      <Hero locale={l} />
      <div className="copper-streak" />
      <DemoVideoSection locale={l} />
      <FeaturesSection />
      <InteractiveDemoSection />
      <div className="copper-streak" />
      <DifferentiationSection />
      <TestimonialsSection />
      <div className="copper-streak" />
      <PricingSection />
      <div className="copper-streak" />
      <FAQSection />
      <FinalCTASection />
      <Footer locale={l} columns={LANDING_FOOTER_COLUMNS} socialLinks={LANDING_SOCIAL_LINKS} />
    </main>
  )
}
