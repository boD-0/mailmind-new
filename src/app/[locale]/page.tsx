'use client'

import { useState, useMemo } from "react"
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
  Send, Mail, Sparkles, Globe, Heart, Shield,
  Zap, Crown,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from '@/components/I18nProvider'
import { Hero } from "@/components/ui/animated-hero"
import { Footer } from "@/components/ui/footer"

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
    nameKey: 'home.pricing.pro.name',
    price: "$29",
    originalPrice: "$49",
    period: '/month',
    periodKey: 'home.pricing.pro.period',
    badge: 'MOST POPULAR',
    badgeKey: 'home.pricing.pro.badge',
    features: [
      'home.pricing.pro.features.0',
      'home.pricing.pro.features.1',
      'home.pricing.pro.features.2',
      'home.pricing.pro.features.3',
      'home.pricing.pro.features.4',
    ],
    ctaKey: 'home.pricing.pro.cta',
    highlight: true,
  },
  {
    nameKey: 'home.pricing.team.name',
    price: "$199",
    period: '/month',
    periodKey: 'home.pricing.team.period',
    badge: null,
    features: [
      'home.pricing.team.features.0',
      'home.pricing.team.features.1',
      'home.pricing.team.features.2',
      'home.pricing.team.features.3',
      'home.pricing.team.features.4',
    ],
    ctaKey: 'home.pricing.team.cta',
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
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#ff5f5f]/5 to-purple-300/5 blur-3xl"
        animate={{
          x: [0, 40, 0, -30, 0],
          y: [0, -30, 20, 10, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 2 */}
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/5 to-[#ff5f5f]/5 blur-3xl"
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
        className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 px-4 py-1.5 rounded-full bg-gray-100/50 border border-gray-200/50"
      >
        {label}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-4"
      >
        {title}{" "}
        <span className="text-[#ff5f5f] bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
          {highlight}
        </span>
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed"
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
            {t('nav.features')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#how-it-works`} className="relative hover:text-[#1a1a1a] transition-colors group">
            {t('nav.how_it_works')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/pricing`} className="relative hover:text-[#1a1a1a] transition-colors group">
            {t('nav.pricing')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#faq`} className="relative hover:text-[#1a1a1a] transition-colors group">
            {t('nav.faq')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <div className="w-px h-5 bg-gray-200" />
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
          >
            {t('nav.log_in')}
          </Link>
          <Link
            href={`/${locale}/sign-up`}
            className="bg-[#ff5f5f] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 relative overflow-hidden group"
          >
            <span className="relative z-10">{t('nav.get_started')}</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-[#ff5f5f]"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-[#1a1a1a] transition-colors"
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
              className="mt-4 pt-4 border-t border-gray-200/50 flex flex-col gap-2"
            >
                <motion.a variants={fadeUp} href={`/${locale}/#features`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.features')}</motion.a>
                <motion.a variants={fadeUp} href={`/${locale}/#how-it-works`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.how_it_works')}</motion.a>
                <Link href={`/${locale}/pricing`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.pricing')}</Link>
                <motion.a variants={fadeUp} href={`/${locale}/#faq`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.faq')}</motion.a>
              <motion.div
                variants={fadeUp}
                className="flex items-center justify-between pb-2 border-b border-gray-100"
              >
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{t('nav.language')}</span>
                <LanguageSwitcher />
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex gap-3 pt-2 mt-2 border-t border-gray-100"
              >
                <Link
                  href={`/${locale}/login`}
                  className="flex-1 text-center text-sm font-medium text-gray-600 px-4 py-2.5 border border-gray-300 rounded-full hover:border-gray-400 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.log_in')}
                </Link>
                <Link
                  href={`/${locale}/sign-up`}
                  className="flex-1 text-center bg-[#ff5f5f] text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-red-500 transition-colors"
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
  const pastelBgs = ["bg-emerald-50", "bg-amber-50", "bg-indigo-50", "bg-rose-50"]

  return (
    <section id="features" className="relative py-24 px-6 bg-white overflow-hidden">
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
                className={`border ${specialist.border} rounded-2xl shadow-sm ${pastelBgs[i]} p-6 cursor-default relative overflow-hidden group`}
                whileHover={{
                  y: -6,
                  boxShadow: `0 12px 30px rgba(0,0,0,0.08)`,
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
                <p className="text-gray-600 leading-relaxed text-sm md:text-base relative z-10">
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
    <section id="how-it-works" className="relative py-24 px-6 bg-[#fdfbf7] overflow-hidden">
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
              className="text-xs font-semibold text-gray-400 tracking-wider uppercase"
            >
              {i + 1}. {label}
            </motion.span>
          ))}
        </motion.div>

        {/* Animated Progress line */}
        <div className="hidden md:block relative h-0.5 bg-gray-200 rounded-full mb-8 mx-2 overflow-hidden">
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
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 z-10"
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
                  className="text-[10px] text-gray-500 font-medium hidden md:block"
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
          <p className="text-xs text-gray-400">
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
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 px-4 py-1.5 rounded-full bg-gray-100/50 border border-gray-200/50">
            {t('home.differentiation.label')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-6 leading-[1.1]">
            {t('home.differentiation.title_1')}{" "}
            <span className="line-through text-gray-300">{t('home.differentiation.title_strikethrough')}</span>
            <br />
            {t('home.differentiation.title_2')}{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
              {t('home.differentiation.title_highlight')}
            </span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
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
                className="flex items-start gap-3 text-gray-600 text-sm group"
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5"
                  whileHover={{ scale: 1.2, backgroundColor: "rgb(167, 243, 208)" }}
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
            className="w-full max-w-sm bg-[#fdfbf7] rounded-2xl border border-gray-200 p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
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
                fill="#ff5f5f"
                fillOpacity="0.12"
                stroke="#ff5f5f"
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
                  fill="#ff5f5f"
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
                  fill="#1a1a1a"
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
              className="mt-4 pt-4 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4 }}
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-[#1a1a1a]">{t('home.differentiation.ocean_profile')}</span>
                <motion.span
                  className="flex items-center gap-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ff5f5f]" />
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
  return (
    <section id="pricing" className="relative py-24 px-6 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label={t('home.pricing.label')}
          title={t('home.pricing.title')}
          highlight={t('home.pricing.highlight')}
          description={t('home.pricing.description')}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.nameKey}
              variants={fadeUpScale}
              custom={i * 0.1}
              className={`rounded-2xl p-8 border bg-white relative flex flex-col ${
                plan.highlight
                  ? "border-[#ff5f5f] border-2 shadow-lg shadow-red-100/50"
                  : "border-gray-200 shadow-sm"
              }`}
              whileHover={{
                y: plan.highlight ? -8 : -6,
                boxShadow: plan.highlight
                  ? "0 20px 40px rgba(255, 95, 95, 0.15)"
                  : "0 12px 30px rgba(0,0,0,0.08)",
                transition: { duration: 0.3 },
              }}
            >
              {plan.badge && (
                <motion.span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ff5f5f] to-rose-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-red-200/50"
                  initial={{ y: -10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                >
                  <Crown size={11} />
                  {plan.badge}
                </motion.span>
              )}
              <h3 className={`font-bold text-lg mb-1 text-[#1a1a1a] ${plan.highlight ? "mt-2" : ""}`}>
                {t(plan.nameKey)}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                {(plan as any).originalPrice && (
                  <span className="text-xl text-gray-300 line-through font-semibold tracking-tighter mr-0.5">
                    {(plan as any).originalPrice}
                  </span>
                )}
                <motion.span
                  className="text-4xl font-extrabold tracking-tighter text-[#1a1a1a]"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                >
                  {plan.price}
                </motion.span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((fKey) => (
                  <motion.li
                    key={fKey}
                    className="flex items-center gap-2.5 text-sm text-gray-600"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{t(fKey)}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-[#ff5f5f] text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-200/50"
                    : "border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-[#1a1a1a]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {t(plan.ctaKey)}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── 7. FAQ ── */

function FAQSection() {
  const { t } = useTranslation()
  return (
    <section id="faq" className="relative py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center text-[#1a1a1a]"
        >
          {t('home.faq.title')}{" "}
          <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
            {t('home.faq.title_highlight')}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-600 text-center mb-12"
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
                <AccordionItem value={`item-${i}`} className="border-gray-200">
                  <AccordionTrigger className="text-sm font-medium text-[#1a1a1a] hover:no-underline group">
                    <span className="flex items-center gap-3">
                      <motion.span
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#ff5f5f]/10 transition-colors"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Zap size={10} className="text-gray-400 group-hover:text-[#ff5f5f] transition-colors" />
                      </motion.span>
                      {t(item.qKey)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pl-9">
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
    <section className="relative bg-gradient-to-br from-[#ff5f5f] to-purple-600 py-24 px-6 text-center overflow-hidden">
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating shapes */}
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
            top: shape.top,
            left: shape.left,
            right: (shape as any).right,
            bottom: (shape as any).bottom,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + i,
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
          {t('home.cta.title')}{" "}
          <motion.span
            className="italic font-bold inline-block"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('home.cta.title_highlight')}
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/80 text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          {t('home.cta.subtitle')}
        </motion.p>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto px-6 py-4 rounded-full bg-white/15 text-white text-sm font-medium"
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
                placeholder={t('home.cta.placeholder')}
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
              {t('home.cta.button')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
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
          {[
            { icon: Shield, textKey: 'home.cta.trust_soc2' },
            { icon: Globe, textKey: 'home.cta.trust_uptime' },
            { icon: Heart, textKey: 'home.cta.trust_nocc' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.span
                key={item.textKey}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Icon size={12} />
                {t(item.textKey)}
              </motion.span>
            )
          })}
        </motion.div>
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

const LANDING_SOCIAL_LINKS = ["footer.social_twitter", "footer.social_linkedin", "footer.social_github"]

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { locale } = useParams()
  const l = locale as string

  return (
    <main className="bg-[#fdfbf7] text-[#1a1a1a] font-sans antialiased selection:bg-[#ff5f5f]/20 selection:text-[#1a1a1a]">
      <Header locale={l} />
      <Hero locale={l} />
      <FeaturesSection />
      <InteractiveDemoSection />
      <DifferentiationSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer locale={l} columns={LANDING_FOOTER_COLUMNS} socialLinks={LANDING_SOCIAL_LINKS} />
    </main>
  )
}
