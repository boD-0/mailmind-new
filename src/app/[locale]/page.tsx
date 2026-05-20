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
  Play, Send, Mail, Sparkles, Globe, Heart, Shield,
  Zap,
} from "lucide-react"

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
    icon: Search,
    bg: "bg-emerald-100",
    iconBg: "bg-emerald-200 text-emerald-700",
    border: "border-emerald-200",
    accent: "emerald",
    description:
      "Scans LinkedIn, news, podcasts and press to surface the precise intel you need — right-moment context that makes your email land.",
  },
  {
    name: "The Psychologist",
    icon: Brain,
    bg: "bg-amber-100",
    iconBg: "bg-amber-200 text-amber-700",
    border: "border-amber-200",
    accent: "amber",
    description:
      "Builds a Big Five OCEAN profile — your Digital Twin. Public signals become a map of how they think, feel, and decide.",
  },
  {
    name: "The Strategist",
    icon: Target,
    bg: "bg-indigo-100",
    iconBg: "bg-indigo-200 text-indigo-700",
    border: "border-indigo-200",
    accent: "indigo",
    description:
      "Plans the outreach angle, hook, tone, and sequence. Knows what to say, in what order, and why it will work.",
  },
  {
    name: "The Copywriter",
    icon: PenTool,
    bg: "bg-rose-100",
    iconBg: "bg-rose-200 text-rose-700",
    border: "border-rose-200",
    accent: "rose",
    description:
      "Writes the actual email — personalized, calibrated, and human. Not a template. A message crafted for one person.",
  },
]

const demoSteps = [
  { icon: Search, label: "Research", color: "bg-emerald-100 text-emerald-600 border-emerald-200", desc: "Deep scan of prospect data" },
  { icon: Brain, label: "Profile", color: "bg-amber-100 text-amber-600 border-amber-200", desc: "Build psychological profile" },
  { icon: Target, label: "Strategy", color: "bg-indigo-100 text-indigo-600 border-indigo-200", desc: "Plan outreach angle" },
  { icon: PenTool, label: "Write", color: "bg-rose-100 text-rose-600 border-rose-200", desc: "Craft personalized email" },
  { icon: Send, label: "Send", color: "bg-purple-100 text-purple-600 border-purple-200", desc: "Ready to deploy" },
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

/** Floating tiny dots/circles in the hero */
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 6 + 4,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#ff5f5f]/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
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
            Features
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/#how-it-works`} className="relative hover:text-[#1a1a1a] transition-colors group">
            How it works
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href={`/${locale}/pricing`} className="relative hover:text-[#1a1a1a] transition-colors group">
            Pricing
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#ff5f5f] transition-all duration-300 group-hover:w-full" />
          </Link>
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
            className="bg-[#ff5f5f] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
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
                <motion.a variants={fadeUp} href={`/${locale}/#features`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Features</motion.a>
                <motion.a variants={fadeUp} href={`/${locale}/#how-it-works`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>How it works</motion.a>
                <Link href={`/${locale}/pricing`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Pricing</Link>
                <motion.a variants={fadeUp} href={`/${locale}/#faq`} className="text-sm text-gray-600 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>FAQ</motion.a>
              <motion.div
                variants={fadeUp}
                className="flex gap-3 pt-2 mt-2 border-t border-gray-100"
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ── 2. HERO ── */

function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="relative pt-24 pb-20 px-6 text-center bg-[#fdfbf7] overflow-hidden">
      <FloatingOrbs />
      <FloatingParticles />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.span
            className="inline-flex items-center gap-1.5 bg-[#ff5f5f]/10 text-[#ff5f5f] text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={12} />
            The AI Swarm for Outreach
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-[#1a1a1a]"
        >
          Cold email, but it{" "}
          <span className="relative inline-block">
            <motion.span
              className="relative z-10 bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x"
            >
              actually knows
            </motion.span>
            <motion.span
              className="absolute -inset-1 bg-[#ff5f5f]/10 rounded-lg -z-10"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </span>{" "}
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
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={`/${locale}/sign-up`}
              className="bg-[#ff5f5f] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50 inline-flex items-center gap-2 group relative overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={`/${locale}/dashboard`}
              className="border border-gray-300 text-gray-600 px-8 py-3.5 rounded-full font-semibold hover:border-gray-400 hover:text-[#1a1a1a] transition-all inline-flex items-center gap-2"
            >
              <Play size={16} />
              Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-16"
        >
          <motion.div
            className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative"
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Mock browser chrome */}
            <div className="flex items-center gap-1.5 px-5 py-3 bg-white border-b border-gray-100">
              <motion.div
                className="w-3 h-3 rounded-full bg-red-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-yellow-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
              />
              <div className="flex-1 max-w-[50%] mx-auto h-7 bg-gray-50 rounded-lg flex items-center px-3 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">app.mailmind.app</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 md:p-8 bg-white">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[Search, Brain, PenTool].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className={`h-16 rounded-xl border p-3 flex items-center gap-3 ${
                      i === 0 ? "bg-emerald-50 border-emerald-100" :
                      i === 1 ? "bg-amber-50 border-amber-100" :
                      "bg-rose-50 border-rose-100"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.15, duration: 0.4 }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      i === 0 ? "bg-emerald-200" : i === 1 ? "bg-amber-200" : "bg-rose-200"
                    }`}>
                      <Icon size={14} className={
                        i === 0 ? "text-emerald-600" : i === 1 ? "text-amber-600" : "text-rose-600"
                      } />
                    </div>
                    <div>
                      <motion.div
                        className={`h-2 w-12 rounded-full mb-1 ${
                          i === 0 ? "bg-emerald-200" : i === 1 ? "bg-amber-200" : "bg-rose-200"
                        }`}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      />
                      <div className={`h-1.5 w-8 rounded-full ${
                        i === 0 ? "bg-emerald-100" : i === 1 ? "bg-amber-100" : "bg-rose-100"
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#ff5f5f] to-rose-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 3. FEATURES — 4 SPECIALISTS ── */

function FeaturesSection() {
  const pastelBgs = ["bg-emerald-50", "bg-amber-50", "bg-indigo-50", "bg-rose-50"]

  return (
    <section id="features" className="relative py-24 px-6 bg-white overflow-hidden">
      <FloatingOrbs />
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label="The Specialists"
          title="Not one model."
          highlight="Four specialists."
          description="Each agent is great at exactly one thing. Together they replace your team — and more."
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
                  <div>
                    <motion.span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${specialist.iconBg}`}
                    >
                      {specialist.name}
                    </motion.span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base relative z-10">
                  {specialist.description}
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
  return (
    <section id="how-it-works" className="relative py-24 px-6 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label="How It Works"
          title="One command."
          highlight="Zero copy-paste."
          description="From prospect name to calibrated email in under 90 seconds."
        />

        {/* Step labels */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="hidden md:flex items-center justify-between mb-4 px-2"
        >
          {["Research", "Profile", "Strategy", "Copy", "Send"].map((label, i) => (
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
                <span className="text-xs font-bold tracking-wide">{step.label}</span>
                <motion.span
                  className="text-[10px] text-gray-500 font-medium hidden md:block"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  {step.desc}
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
            Research → Profile → Strategy → Copy → Send
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── 5. DIFFERENTIATION ── */

function DifferentiationSection() {
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
            The Difference
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1a1a1a] mb-6 leading-[1.1]">
            We don&apos;t write to a{" "}
            <span className="line-through text-gray-300">job title.</span>
            <br />
            We write to a{" "}
            <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
              person.
            </span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Most outreach tools blast the same template to hundreds of people. MailMind builds a psychological
            profile of each prospect — their motivations, communication style, and decision-making patterns —
            then crafts an email calibrated specifically for them.
          </p>
          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {[
              "Big Five OCEAN profile built from public signals",
              "Personality-matched tone, hook, and angle for every email",
              "Sandbox simulation predicts prospect reaction before you send",
              "Continuous learning from engagement patterns",
            ].map((item) => (
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
                <span className="font-semibold text-[#1a1a1a]">OCEAN Profile</span>
                <motion.span
                  className="flex items-center gap-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ff5f5f]" />
                  Digital Twin
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
  return (
    <section id="pricing" className="relative py-24 px-6 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <SectionHeading
          label="Pricing"
          title="Simple, transparent"
          highlight="pricing."
          description="Start free, upgrade when you need more. Cancel anytime."
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
              key={plan.name}
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
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-[#ff5f5f] text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm"
                  initial={{ y: -10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                >
                  {plan.badge}
                </motion.span>
              )}
              <h3 className={`font-bold text-lg mb-1 text-[#1a1a1a] ${plan.highlight ? "mt-2" : ""}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
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
                {plan.features.map((f) => (
                  <motion.li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-gray-600"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{f}</span>
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
                {plan.cta}
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
          Frequently asked{" "}
          <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
            questions.
          </span>
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
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <Accordion type="single" collapsible className="w-full">
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
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pl-9">
                    {item.a}
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
          Ready to send emails{" "}
          <motion.span
            className="italic font-bold inline-block"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            that get replies?
          </motion.span>
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto px-6 py-4 rounded-full bg-white/15 text-white text-sm font-medium"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✓ You&apos;re in! Check your inbox for next steps.
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

        {/* Trust indicators */}
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

/* ── 9. FOOTER ── */

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
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#pricing", label: "Pricing" },
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
                    <a href={link.href} className="hover:text-[#1a1a1a] transition-colors relative inline-block group/link">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#ff5f5f] transition-all duration-300 group-hover/link:w-full" />
                    </a>
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
              <a
                key={social}
                href="#"
                className="hover:text-gray-600 transition-colors relative group/social"
              >
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
