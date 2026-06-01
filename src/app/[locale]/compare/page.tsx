'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight, Check, X, Minus, Zap, Brain, Search, Shield, BarChart3, Users, Globe } from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
}

const competitors = [
  { key: "lemlist", name: "Lemlist", color: "text-blue-500" },
  { key: "apollo", name: "Apollo", color: "text-purple-500" },
  { key: "clay", name: "Clay", color: "text-orange-500" },
  { key: "instantly", name: "Instantly", color: "text-emerald-500" },
]

export default function ComparePage() {
  const { locale } = useParams()
  const { t } = useTranslation()

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
            {t('compare.cta')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-8 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-b from-copper/10 to-transparent blur-3xl"
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={12} />
              {t('compare.hero_badge')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-4">
            {t('compare.hero_title_1')}{" "}
            <span className="text-copper">{t('compare.hero_title_highlight')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            {t('compare.hero_subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-bold text-foreground sticky left-0 bg-card z-10 min-w-[160px]">
                    {t('compare.table_header')}
                  </th>
                  {competitors.map((comp) => (
                    <th key={comp.key} className="p-4 font-bold text-center min-w-[120px]">
                      <span className={comp.color}>{comp.name}</span>
                    </th>
                  ))}
                  <th className="p-4 font-bold text-center min-w-[120px] bg-copper/5">
                    <span className="text-copper">MailMind</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    rowKey: "personalization",
                    icon: Users,
                    them: t('compare.row_personalization_them'),
                    us: t('compare.row_personalization_us'),
                  },
                  {
                    rowKey: "agents",
                    icon: Zap,
                    them: t('compare.row_agents_them'),
                    us: t('compare.row_agents_us'),
                  },
                  {
                    rowKey: "research",
                    icon: Search,
                    them: t('compare.row_research_them'),
                    us: t('compare.row_research_us'),
                  },
                  {
                    rowKey: "psychology",
                    icon: Brain,
                    them: t('compare.row_psychology_them'),
                    us: t('compare.row_psychology_us'),
                  },
                  {
                    rowKey: "simulation",
                    icon: BarChart3,
                    them: t('compare.row_simulation_them'),
                    us: t('compare.row_simulation_us'),
                  },
                  {
                    rowKey: "spam",
                    icon: Shield,
                    them: t('compare.row_spam_them'),
                    us: t('compare.row_spam_us'),
                  },
                  {
                    rowKey: "price",
                    icon: Globe,
                    them: t('compare.row_price'),
                    isPrice: true,
                  },
                ].map((row, i) => {
                  const Icon = row.icon
                  return (
                    <motion.tr key={row.rowKey}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="text-muted-foreground" />
                          <span className="font-medium text-foreground text-xs">
                            {t(`compare.row_${row.rowKey}`)}
                          </span>
                        </div>
                      </td>
                      {competitors.map((comp) => (
                        <td key={comp.key} className="p-4 text-center">
                          {row.isPrice ? (
                            <span className="text-xs text-muted-foreground">$49–$99/mo</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Minus size={14} className="text-muted-foreground/40" />
                              <span className="text-xs text-muted-foreground/70">{row.them}</span>
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-center bg-copper/5">
                        {row.isPrice ? (
                          <span className="text-xs font-bold text-copper">Free / $49/mo</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Check size={14} className="text-emerald-500" />
                            <span className="text-xs font-medium text-foreground">{row.us}</span>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 text-center">
            <Link href={`/${locale}/sign-up`}
              className="bg-copper text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 group shadow-sm hover:shadow-md">
              {t('compare.cta')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">14-day free trial — no credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-border mt-12">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. All rights reserved.</p>
      </footer>
    </main>
  )
}
