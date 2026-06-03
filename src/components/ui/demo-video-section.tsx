'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Play } from "lucide-react"

/**
 * Demo video embed section for the landing page.
 * References a Loom/Screen Studio video embed.
 * Replace VIDEO_URL with actual demo video URL.
 */
const VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "https://www.loom.com/embed/placeholder"

export default function DemoVideoSection({ locale }: { locale: string }) {
  return (
    <section className="relative py-20 px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-12"
        >
          <motion.span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-4 py-1.5 rounded-full bg-card border border-border">
            <Play size={12} className="inline mr-1.5 -mt-0.5" />
            See it in action
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4">
            Watch the swarm{" "}
            <span className="text-copper">come alive.</span>
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            From prospect name to calibrated email in 90 seconds. No magic — just 4 specialized AI agents working together.
          </motion.p>
        </motion.div>

        {/* Video embed */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-obsidian-mid"
            style={{ aspectRatio: "16/9" }}>
            {/* Gradient border glow */}
            <motion.div
              className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(193,123,63,0.4), rgba(168,85,247,0.2), rgba(193,123,63,0.4))",
                filter: "blur(12px)",
              }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Video iframe */}
            <iframe
              src={VIDEO_URL}
              className="w-full h-full rounded-2xl relative z-10"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              title="MailMind Demo Video"
            />
          </div>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            90-second demo — watch the full swarm workflow
          </motion.p>
        </motion.div>

        {/* CTA under video */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href={`/${locale}/demo`}
            className="inline-flex items-center gap-2 bg-copper text-white px-6 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-all group"
          >
            Try the Interactive Demo
            <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
