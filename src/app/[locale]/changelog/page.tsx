'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight, Zap, BarChart3, Shield, Globe, Brain } from "lucide-react"

const changelog = [
  {
    version: "v1.2.1",
    date: "May 26, 2026",
    badge: "Latest",
    sections: [
      {
        title: "Bug Fixes",
        icon: Shield,
        items: [
          "Fixed Sentry deprecation warnings: migrated disableLogger → webpack.treeshake.removeDebugLogging and reactComponentAnnotation → webpack.reactComponentAnnotation",
          "Resolved middleware.ts / proxy.ts conflict — migrated to Next.js proxy convention (deleted middleware.ts, proxy.ts now uses default export)",
          "Fixed CSS import path in globals.css (../../styles/tokens.css → ../styles/tokens.css)",
          "Created .env.local with auto-generated auth secret for local development",
        ],
      },
    ],
  },
  {
    version: "v1.2",
    date: "May 25, 2026",
    badge: "",
    sections: [
      {
        title: "Pricing & Monetization",
        icon: Globe,
        items: [
          "New pricing: Free ($0), Starter ($49/mo), Professional ($149/mo)",
          "14-day Professional trial on every new account — no credit card required",
          "Trial banner in dashboard with days remaining and upgrade CTA",
          "Monthly swarm execution limits per plan tier",
        ],
      },
      {
        title: "Swarm Execution Counter",
        icon: BarChart3,
        items: [
          "Usage bar in dashboard showing monthly swarm count vs plan limit",
          "Color-coded progress (green → amber → red) with upgrade prompt at 90%+",
          "Swarm launch API now enforces monthly execution limits with 429 response",
        ],
      },
      {
        title: "Security & Trust",
        icon: Shield,
        items: [
          "Public status page at /status — real-time system health monitoring",
          "Security page at /security — SOC 2, GDPR, encryption details",
          "Comparison page vs Lemlist, Apollo, Clay, Instantly",
          "Waitlist system with early bird access (first 100 get 3 months free)",
        ],
      },
    ],
  },
  {
    version: "v1.1",
    date: "May 22, 2026",
    sections: [
      {
        title: "UI Polish & Consistency",
        icon: Sparkles,
        items: [
          "Unified all components to use semantic color tokens",
          "Added loading states and error boundaries to all routes",
          "Improved mobile responsiveness across the dashboard",
        ],
      },
      {
        title: "i18n Completeness",
        icon: Globe,
        items: [
          "Full English, French, German, and Romanian translations",
          "Parity checker script ensures all locales stay in sync",
        ],
      },
    ],
  },
  {
    version: "v1.0",
    date: "May 15, 2026",
    sections: [
      {
        title: "Initial Launch",
        icon: Zap,
        items: [
          "4-agent swarm: Researcher, Psychologist, Strategist, Copywriter",
          "OCEAN personality profiling via Digital Twin",
          "War Room with real-time agent visualization",
          "Vault for document upload and context enrichment",
          "Aurelius AI assistant for onboarding and coaching",
        ],
      },
      {
        title: "Infrastructure",
        icon: Brain,
        items: [
          "PostgreSQL via Neon with Drizzle ORM",
          "Cloudflare R2 for file storage",
          "Upstash Redis for caching and rate limiting",
          "Polar.sh + Stripe for subscription management",
          "Better-Auth for authentication with Google OAuth",
        ],
      },
    ],
  },
]

export default function ChangelogPage() {
  const { locale } = useParams()

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <motion.div className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm" whileHover={{ rotate: -10, scale: 1.05 }}>
              <span className="text-white text-xs font-extrabold tracking-tight">M</span>
            </motion.div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Changelog</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles size={12} />
            What&apos;s New
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            MailMind{" "}
            <span className="text-copper">Changelog</span>
          </h1>
          <p className="text-muted-foreground">
            Every improvement, fix, and new feature — documented.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-16">
            {changelog.map((release, ri) => (
              <motion.div key={release.version}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5 }}
                className="relative md:pl-12">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-0 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-copper bg-background z-10">
                  <motion.div className="w-full h-full rounded-full bg-copper"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                </div>

                {/* Release header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-extrabold tracking-tight">{release.version}</h2>
                  {release.badge && (
                    <span className="text-[10px] font-bold bg-copper/10 text-copper px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {release.badge}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{release.date}</span>
                </div>

                {/* Sections */}
                <div className="space-y-5">
                  {release.sections.map((section, si) => {
                    const Icon = section.icon
                    return (
                      <div key={si} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                          <Icon size={16} className="text-copper" />
                          <h3 className="text-sm font-bold">{section.title}</h3>
                        </div>
                        <ul className="space-y-1.5">
                          {section.items.map((item, ii) => (
                            <li key={ii} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-copper/40 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-16 text-center">
          <Link href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight size={14} className="rotate-180" />
            Back to MailMind
          </Link>
        </motion.div>
      </div>

      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. All rights reserved.</p>
      </footer>
    </main>
  )
}
