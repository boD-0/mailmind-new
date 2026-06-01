'use client'

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Shield, Lock, FileText, Clock, Users, Mail } from "lucide-react"
import { useTranslation } from "@/components/I18nProvider"

export default function SecurityPage() {
  const { locale } = useParams()
  const { t } = useTranslation()

  const sections = [
    { icon: Shield, titleKey: "security.soc2_title", descKey: "security.soc2_desc" },
    { icon: Shield, titleKey: "security.gdpr_title", descKey: "security.gdpr_desc" },
    { icon: Lock, titleKey: "security.encryption_title", descKey: "security.encryption_desc" },
    { icon: FileText, titleKey: "security.data_title", descKey: "security.data_desc" },
    { icon: Clock, titleKey: "security.retention_title", descKey: "security.retention_desc" },
    { icon: Users, titleKey: "security.subprocessors_title", descKey: "security.subprocessors_desc" },
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
            {t("security.hero_badge")}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-6"
            animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Shield size={12} />
            {t("security.hero_badge")}
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {t("security.hero_title_1")}{" "}
            <span className="text-copper">{t("security.hero_title_highlight")}</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("security.hero_subtitle")}
          </p>
        </motion.div>

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
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail size={18} className="text-copper" />
            <h2 className="text-sm font-bold">{t("security.contact_title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("security.contact_desc")}
          </p>
        </motion.div>
      </div>

      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2025 MailMind. All rights reserved.</p>
      </footer>
    </main>
  )
}
