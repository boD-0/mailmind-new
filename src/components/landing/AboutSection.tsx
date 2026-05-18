'use client'

import { motion } from 'framer-motion'

export function AboutSection() {
  const values = [
    { title: 'Empatie', desc: 'Înțelegem nu doar ce fac oamenii, ci de ce o fac.' },
    { title: 'Inteligență', desc: 'Swarm-ul nostru colaborează pentru a găsi unghiul perfect.' },
    { title: 'Eficiență', desc: 'Research-ul care dura ore acum durează secunde.' },
  ]

  return (
    <section className="py-24 px-6 bg-obsidian-mid">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif text-cream mb-8">Outreach de altă clasă.</h2>
            <p className="text-cream/70 leading-relaxed mb-8">
              MailMind nu este doar un alt instrument de trimis emailuri. Este un ecosistem strategic 
              care simulează psihologia prospectului tău într-un sandbox controlat, înainte de orice interacțiune reală.
            </p>
            <div className="space-y-6">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-copper/10 border border-copper/30 flex items-center justify-center text-copper shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-cream font-medium mb-1">{v.title}</h4>
                    <p className="text-cream/50 text-sm">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[400px] glass-card rounded-3xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-burgundy-deep/20 to-transparent" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="w-48 h-48 border-2 border-dashed border-copper/20 rounded-full flex items-center justify-center"
            >
              <div className="w-32 h-32 border border-copper/40 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-copper rounded-full shadow-[0_0_20px_#C17B3F]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
