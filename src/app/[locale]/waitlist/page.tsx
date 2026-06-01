'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Mail, ArrowRight, Sparkles, Users, Clock, Check, Loader2, Zap, Shield,
} from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
}

export default function WaitlistPage() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [result, setResult] = useState<{ position: number; earlyBird: boolean } | null>(null)
  const [stats, setStats] = useState<{ total: number; earlyBirdRemaining: number }>({ total: 0, earlyBirdRemaining: 100 })
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/waitlist")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setJoined(true)
        setStats(prev => ({ ...prev, total: data.total, earlyBirdRemaining: Math.max(0, 100 - data.total) }))
      } else {
        setError(data.error || "Something went wrong.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-copper/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <motion.div
              className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm"
              whileHover={{ rotate: -10, scale: 1.05 }}
            >
              <span className="text-white text-xs font-extrabold tracking-tight">M</span>
            </motion.div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-copper/5 to-amber-200/5 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/5 to-copper/5 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={12} />
              Early Access
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6"
          >
            Be the first to experience{" "}
            <span className="text-copper">AI-powered emails</span>{" "}
            that actually know your prospects.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
          >
            Four specialized AI agents that research, profile, strategize, and write personalized emails — not templates. Join the waitlist now and get early access.
          </motion.p>
        </div>
      </section>

      {/* Form section */}
      <section className="pb-16 px-6">
        <div className="max-w-md mx-auto">
          {!joined ? (
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onSubmit={handleJoin}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Your email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-copper focus:ring-1 focus:ring-copper/20 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Name <span className="text-muted-foreground/50 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-copper focus:ring-1 focus:ring-copper/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-copper text-white py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Join the Waitlist
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              <p className="text-xs text-center text-muted-foreground">
                No spam, ever. We&apos;ll send you a single email when you get access.
              </p>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm text-center space-y-4"
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              >
                <Check size={28} className="text-emerald-600" />
              </motion.div>

              <h2 className="text-2xl font-extrabold tracking-tight">
                You&apos;re on the list! 🎉
              </h2>

              <p className="text-muted-foreground">
                You are <span className="font-bold text-foreground">#{result?.position}</span> in line.
              </p>

              {result?.earlyBird && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-4 py-2"
                >
                  <Zap size={14} />
                  <span className="text-sm font-semibold">You got Early Bird! 🎉</span>
                  <span className="text-xs text-amber-600">3 months STARTER free when we launch</span>
                </motion.div>
              )}

              <div className="pt-4 border-t border-border">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-2 text-sm text-copper font-semibold hover:opacity-80 transition-opacity"
                >
                  ← Back to home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats + Benefits */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          {/* Live counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
              <motion.p
                className="text-4xl font-extrabold text-copper mb-1"
                key={stats.total}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stats.total}
              </motion.p>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                On Waitlist
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
              <motion.p
                className="text-4xl font-extrabold text-amber-500 mb-1"
                key={stats.earlyBirdRemaining}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stats.earlyBirdRemaining}
              </motion.p>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                Early Bird Spots Left
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border shadow-sm col-span-2 md:col-span-1">
              <p className="text-4xl font-extrabold text-emerald-500 mb-1">3</p>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                Months Free STARTER
              </p>
            </div>
          </motion.div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Priority Access", desc: "First to try new features before public release" },
              { icon: Users, title: "Community", desc: "Private Discord with founders and early adopters" },
              { icon: Shield, title: "Influence", desc: "Your feedback shapes the product roadmap" },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-5 bg-card rounded-xl border border-border"
              >
                <benefit.icon size={20} className="text-copper shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-0.5">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              We launch in a few weeks. Be the first to know.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sm text-copper font-semibold hover:opacity-80 transition-opacity"
            >
              <ArrowRight size={14} className="rotate-180" />
              Back to MailMind
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
