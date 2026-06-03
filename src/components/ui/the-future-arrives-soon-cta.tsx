'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Clock } from 'lucide-react'

const TARGET_DATE = new Date()
TARGET_DATE.setDate(TARGET_DATE.getDate() + 3)
TARGET_DATE.setHours(0, 0, 0, 0)

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now()

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { hours, minutes, seconds }
}

function AnimatedDigit({ value }: { value: number }) {
  return (
    <div className="relative h-[1em] w-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center bg-card border-2 border-border rounded-2xl px-6 py-5 md:px-8 md:py-7 min-w-[90px] md:min-w-[110px] shadow-[4px_4px_0px_var(--foreground)] overflow-hidden group hover:shadow-[6px_6px_0px_var(--foreground)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-b from-copper/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          <AnimatedDigit value={value} />
        </span>
      </div>
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function CountdownBanner() {
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(() => {
    if (typeof window === "undefined") return null;
    return getTimeLeft();
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(getTimeLeft());
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[800px] h-[600px] bg-copper/8 rounded-full blur-3xl -top-1/2 -left-1/4" />
        <div className="absolute w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl bottom-0 right-0" />
        <div className="absolute w-[400px] h-[400px] bg-copper/10 rounded-full blur-3xl top-1/3 right-1/4" />
      </div>

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative rounded-2xl border border-border bg-card p-8 md:p-16 flex flex-col items-center gap-8 md:gap-12 text-center shadow-xl overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-copper/3 to-transparent pointer-events-none" />

          <div className="flex flex-col items-center gap-4 relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-copper/10 border border-copper/20 text-sm font-semibold text-copper"
            >
              <Sparkles className="w-4 h-4" />
              <span>Under Maintenance</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tighter text-foreground">
              We&apos;ll be back
              <br />
              <span className="text-copper">very soon</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
              We&apos;re performing scheduled upgrades to bring you an even better experience.
              Thanks for your patience!
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-10">
            <TimeUnit value={time?.hours ?? 0} label="Hours" />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-muted-foreground/50 animate-pulse">:</span>
            </div>
            <TimeUnit value={time?.minutes ?? 0} label="Minutes" />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-muted-foreground/50 animate-pulse">:</span>
            </div>
            <TimeUnit value={time?.seconds ?? 0} label="Seconds" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative z-10"
          >
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-copper text-white font-semibold hover:bg-copper/80 transition-all duration-200 shadow-lg shadow-copper/20 active:scale-[0.98]">
              <span>Notify Me When Ready</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-card text-muted-foreground font-medium hover:bg-muted hover:text-foreground transition-all duration-200 border border-border hover:border-copper/30 active:scale-[0.98]">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Add to Calendar</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-8 text-xs text-muted-foreground/50 tracking-wider"
        >
          MailMind <span className="mx-2">·</span> Swarm Intelligence Email
        </motion.p>
      </div>
    </section>
  )
}
