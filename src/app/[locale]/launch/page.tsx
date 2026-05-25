'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight, Star, Trophy, Zap, Users, Rocket, Check, Clock, BarChart3, Globe, Search, Brain, Target, PenTool, Play } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
}

const highlights = [
  { icon: Zap, text: "4 specialized AI agents working in parallel", color: "text-copper" },
  { icon: Star, text: "OCEAN personality profiling for every prospect", color: "text-amber-500" },
  { icon: BarChart3, text: "Sandbox simulation predicts prospect reaction", color: "text-emerald-500" },
  { icon: Globe, text: "Automated research: LinkedIn, news, podcasts", color: "text-indigo-500" },
  { icon: Rocket, text: "Complete email in under 90 seconds", color: "text-copper" },
  { icon: Shield, text: "AI-powered SpamGuard before you send", color: "text-purple-500" },
]

function Shield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

const testimonials = [
  { quote: "Finally, an email tool that doesn't feel like a mail merge. The OCEAN profiling is genuinely different.", name: "Alex M.", role: "VP Sales, Series A SaaS" },
  { quote: "Our reply rate went from 3% to 11% using MailMind. The psychological calibration is the real deal.", name: "Jamie K.", role: "Founder, Growth Agency" },
  { quote: "It's like having a research team, psychologist, and copywriter on staff — but it costs less than one SDR.", name: "Priya R.", role: "Head of Outbound" },
]

export default function LaunchPage() {
  const { locale } = useParams()

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <motion.div className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm" whileHover={{ rotate: -10, scale: 1.05 }}>
              <span className="text-white text-xs font-extrabold tracking-tight">M</span>
            </motion.div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
          <Link href={`/${locale}/sign-up`} className="bg-copper text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all">
            Get Early Access
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-12 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-b from-copper/10 to-transparent blur-3xl"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <motion.span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Trophy size={12} />
              Launching on Product Hunt
            </motion.span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6">
            Cold email that{" "}
            <span className="text-copper">actually knows</span>{" "}
            the person on the other side.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            MailMind uses 4 AI agents — Researcher, Psychologist, Strategist, and Copywriter — to write emails that feel personal because they are.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/${locale}/sign-up`} className="bg-copper text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all hover:shadow-sm inline-flex items-center gap-2 group">
              Try it Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={`/${locale}/demo`} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
              <Play size={14} />
              Live Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Key differentiators */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-12">
            What makes MailMind{" "}
            <span className="text-copper">different</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((item, i) => (
              <motion.div key={item.text} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <item.icon size={20} className={item.color} />
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-4">
            How it works
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-muted-foreground text-center mb-12 max-w-md mx-auto">
            Enter a prospect name. Get a personalized email in under 90 seconds.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Research", desc: "Scans LinkedIn, news, and press for context", icon: Search, color: "emerald" },
              { step: "2", title: "Profile", desc: "Builds Big Five OCEAN psychological profile", icon: Brain, color: "amber" },
              { step: "3", title: "Strategy", desc: "Plans angle, tone, hook, and sequence", icon: Target, color: "indigo" },
              { step: "4", title: "Write", desc: "Crafts a personalized, human-sounding email", icon: PenTool, color: "rose" },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 bg-card rounded-xl border border-border text-center`}>
                <div className={`w-10 h-10 rounded-full bg-${item.color}-100 flex items-center justify-center mx-auto mb-3`}>
                  <item.icon size={18} className={`text-${item.color}-600`} />
                </div>
                <p className="text-sm font-bold mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-12">
            What beta users{" "}
            <span className="text-copper">are saying</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-primary">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-4">
            Ready to write emails that{" "}
            <span className="text-copper">actually get replies?</span>
          </h2>
          <p className="text-white/70 mb-8">Join the waitlist. First 100 get 3 months free.</p>
          <Link href={`/${locale}/sign-up`} className="bg-white text-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 group">
            Get Early Access
            <Rocket size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. Crafted with AI — sent with intention.</p>
      </footer>
    </main>
  )
}


