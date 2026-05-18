'use client'

import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden">
      {/* Background visual element */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-burgundy-deep blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-serif text-cream leading-tight mb-6">
            Gândire de <span className="text-copper">Swarm</span>.<br />
            Outreach de Imperiu.
          </h1>
          <p className="text-xl md:text-2xl text-cream/60 max-w-3xl mx-auto leading-relaxed">
            Primul sistem AI care îți înțelege prospectul prin Digital Twin Synthesis 
            înainte să trimiți un singur cuvânt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-6 justify-center"
        >
          <button className="px-10 py-4 bg-burgundy-mid hover:bg-burgundy-deep text-copper border border-copper/30 rounded-full transition-all duration-300 text-lg tracking-widest luxury-shadow">
            LANSEAZĂ SWARM-UL
          </button>
          <button className="px-10 py-4 glass-card hover:bg-white/10 text-cream rounded-full transition-all duration-300 text-lg tracking-widest">
            VEZI DEMO
          </button>
        </motion.div>
      </div>

      {/* Floating indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 text-copper/40 text-sm tracking-widest"
      >
        SCROLL PENTRU ANALIZĂ
      </motion.div>
    </section>
  )
}
