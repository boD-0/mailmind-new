"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Clock } from "lucide-react";
import { useParams } from "next/navigation";

function getTargetDate() {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + 2);
  target.setHours(3, 0, 0, 0);
  return target;
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function AnimatedDigit({ value }: { value: number }) {
  return (
    <div className="relative h-[1em] w-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl px-6 py-5 md:px-8 md:py-7 min-w-[90px] md:min-w-[110px] shadow-[4px_4px_0px_#1a1a1a] overflow-hidden group hover:shadow-[6px_6px_0px_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff5f5f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1a1a1a]">
          <AnimatedDigit value={value} />
        </span>
      </div>
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
        {label}
      </span>
    </div>
  );
}

export default function MaintenancePage() {
  const { locale } = useParams();
  const l = (locale as string) || "ro";
  const [target] = useState(() => getTargetDate());
  const [time, setTime] = useState(() => getTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!mounted) return null;

  const isRo = l === "ro";

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-[#fdfbf7] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[800px] h-[600px] bg-[#ff5f5f]/8 rounded-full blur-3xl -top-1/2 -left-1/4" />
        <div className="absolute w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl bottom-0 right-0" />
        <div className="absolute w-[400px] h-[400px] bg-[#ff5f5f]/10 rounded-full blur-3xl top-1/3 right-1/4" />
      </div>

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 md:p-16 flex flex-col items-center gap-8 md:gap-12 text-center shadow-[8px_8px_0px_#1a1a1a] overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff5f5f]/3 to-transparent pointer-events-none" />

          <div className="flex flex-col items-center gap-4 relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f5f]/10 border border-[#ff5f5f]/20 text-sm font-semibold text-[#ff5f5f]"
            >
              <Sparkles className="w-4 h-4 animate-sparkle" />
              <span>{isRo ? "În Mentenanță" : "Under Maintenance"}</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tighter text-[#1a1a1a]">
              {isRo ? "Ne întoarcem" : "We'll be back"}
              <br />
              <span className="text-[#ff5f5f]">
                {isRo ? "foarte curând" : "very soon"}
              </span>
            </h2>

            <p className="text-gray-500 text-base md:text-lg max-w-xl leading-relaxed">
              {isRo
                ? "Facem upgrade-uri programate pentru o experiență și mai bună. Mulțumim pentru răbdare!"
                : "We're performing scheduled upgrades to bring you an even better experience. Thanks for your patience!"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-10">
            <TimeUnit value={time.hours} label={isRo ? "Ore" : "Hours"} />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-gray-300 animate-pulse">:</span>
            </div>
            <TimeUnit value={time.minutes} label={isRo ? "Minute" : "Minutes"} />
            <div className="flex flex-col items-center justify-center pb-6">
              <span className="text-2xl md:text-4xl font-light text-gray-300 animate-pulse">:</span>
            </div>
            <TimeUnit value={time.seconds} label={isRo ? "Secunde" : "Seconds"} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative z-10"
          >
            <a
              href={`/${l}/login`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#ff5f5f] text-white font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 squishy"
            >
              <span>{isRo ? "Autentificare Admin" : "Admin Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors border-2 border-gray-200 hover:border-gray-300 squishy">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{isRo ? "Adaugă în Calendar" : "Add to Calendar"}</span>
            </button>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-8 text-xs text-gray-300 tracking-wider"
        >
          MailMind <span className="mx-2">·</span> Swarm Intelligence Email
        </motion.p>
      </div>
    </section>
  );
}
