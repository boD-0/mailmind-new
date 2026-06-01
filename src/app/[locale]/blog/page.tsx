'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight, Brain, TrendingUp, Mail, Users, Shield, Zap, Clock } from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Brain, TrendingUp, Mail, Users, Shield, Zap, Clock,
}

export default function BlogPage() {
  const { locale } = useParams()
  const { t } = useTranslation()

  const posts = [
    {
      slug: "what-is-ocean-personality",
      icon: "Brain",
      date: "2026-05-20",
      readTime: "5 min",
    },
    {
      slug: "why-personalized-emails-work",
      icon: "Mail",
      date: "2026-05-15",
      readTime: "7 min",
    },
    {
      slug: "cold-email-vs-calibrated",
      icon: "TrendingUp",
      date: "2026-05-10",
      readTime: "6 min",
    },
    {
      slug: "ai-agents-b2b-outreach",
      icon: "Zap",
      date: "2026-05-05",
      readTime: "8 min",
    },
    {
      slug: "sdr-burnout-psychology",
      icon: "Users",
      date: "2026-04-28",
      readTime: "5 min",
    },
    {
      slug: "email-deliverability-guide",
      icon: "Shield",
      date: "2026-04-20",
      readTime: "4 min",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <motion.div className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm" whileHover={{ rotate: -10, scale: 1.05 }}>
              <span className="text-white text-xs font-extrabold tracking-tight">M</span>
            </motion.div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles size={12} />
            {t("blog.badge") || "B2B Psychology"}
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {t("blog.title_1") || "The MailMind"} {" "}
            <span className="text-copper">{t("blog.title_highlight") || "Blog"}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("blog.subtitle") || "Deep dives into B2B psychology, cold email strategy, and AI-powered outreach."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post, i) => {
            const Icon = iconMap[post.icon] || Brain
            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block bg-card border border-border rounded-xl p-5 hover:border-copper/30 hover:shadow-lg hover:shadow-copper/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-copper/10 flex items-center justify-center">
                      <Icon size={16} className="text-copper" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{post.date}</p>
                      <div className="flex items-center gap-2">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-sm font-bold text-foreground group-hover:text-copper transition-colors mb-1.5">
                    {t(`blog.${post.slug}_title`) || post.slug}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {t(`blog.${post.slug}_excerpt`) || ""}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-copper opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("blog.read_more") || "Read more"}
                    <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-16 text-center">
          <Link href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight size={14} className="rotate-180" />
            {t("blog.back_home") || "Back to MailMind"}
          </Link>
        </motion.div>
      </div>

      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. All rights reserved.</p>
      </footer>
    </main>
  )
}
