'use client'

import { use } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Clock, User, Calendar } from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

interface BlogParams {
  slug: string
}

const postMeta: Record<string, { date: string; author: string; readTime: string }> = {
  "what-is-ocean-personality": { date: "May 20, 2026", author: "MailMind Team", readTime: "5 min read" },
  "why-personalized-emails-work": { date: "May 15, 2026", author: "MailMind Team", readTime: "7 min read" },
  "cold-email-vs-calibrated": { date: "May 10, 2026", author: "MailMind Team", readTime: "6 min read" },
  "ai-agents-b2b-outreach": { date: "May 5, 2026", author: "MailMind Team", readTime: "8 min read" },
  "sdr-burnout-psychology": { date: "April 28, 2026", author: "MailMind Team", readTime: "5 min read" },
  "email-deliverability-guide": { date: "April 20, 2026", author: "MailMind Team", readTime: "4 min read" },
}

export default function BlogPostPage({ params }: { params: Promise<BlogParams> }) {
  const { slug } = use(params)
  const { locale } = useParams()
  const { t } = useTranslation()
  const meta = postMeta[slug]

  if (!meta) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t("blog.not_found") || "Post not found"}</h1>
          <Link href={`/${locale}/blog`} className="text-copper text-sm hover:underline">
            ← {t("blog.back_to_blog") || "Back to blog"}
          </Link>
        </div>
      </main>
    )
  }

  const title = t(`blog.${slug}_title`) || slug.replace(/-/g, " ")
  const body = t(`blog.${slug}_body`) || ""

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

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors mb-8">
          <ArrowRight size={14} className="rotate-180" />
          {t("blog.back_to_blog") || "Back to blog"}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {meta.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={12} />
              {meta.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {meta.readTime}
            </span>
          </div>

          <div className="prose prose-sm prose-gray max-w-none space-y-4 text-muted-foreground leading-relaxed">
            {body ? (
              body.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <>
                <p className="text-sm">
                  {t("blog.coming_soon") || "Full article coming soon. This is a placeholder for the blog post content."}
                </p>
              </>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-border">
          <Link href={`/${locale}/sign-up`}
            className="inline-flex items-center gap-2 bg-copper text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow-md">
            {t("blog.cta") || "Try MailMind Free"}
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">14-day free trial — no credit card required</p>
        </motion.div>
      </article>
    </main>
  )
}
