'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, Lock, FileText, UserCheck, Cookie, Globe } from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

export default function PrivacyPage() {
  const { locale } = useParams()
  const { t } = useTranslation()

  const sections = [
    { icon: Eye, titleKey: "privacy.collection_title", descKey: "privacy.collection_desc" },
    { icon: Lock, titleKey: "privacy.storage_title", descKey: "privacy.storage_desc" },
    { icon: FileText, titleKey: "privacy.usage_title", descKey: "privacy.usage_desc" },
    { icon: Cookie, titleKey: "privacy.cookies_title", descKey: "privacy.cookies_desc" },
    { icon: UserCheck, titleKey: "privacy.rights_title", descKey: "privacy.rights_desc" },
    { icon: Globe, titleKey: "privacy.transfers_title", descKey: "privacy.transfers_desc" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-copper rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-extrabold">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight">MailMind</span>
          </Link>
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {t("privacy.hero_badge")}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Shield size={12} />
            {t("privacy.hero_badge")}
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {t("privacy.hero_title_1")}{" "}
            <span className="text-copper">{t("privacy.hero_title_highlight")}</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("privacy.hero_subtitle")}
          </p>
        </motion.div>

        {/* Last updated */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-center text-xs text-muted-foreground mb-12">
          {t("privacy.last_updated")}
        </motion.p>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div key={section.titleKey} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
                <section.icon size={20} className="text-copper" />
              </div>
              <div>
                <h2 className="text-sm font-bold mb-2">{t(section.titleKey)}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(section.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 p-6 bg-card border border-border rounded-xl text-center">
          <h2 className="text-sm font-bold mb-2">{t("privacy.contact_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("privacy.contact_desc")}
          </p>
        </motion.div>
      </div>

      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. All rights reserved.</p>
      </footer>
    </main>
  )
}
