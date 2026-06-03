"use client";

import { motion, type Variants } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/**
 * Visual stars rating component that also supports fractional display
 * for testimonials where metrics matter more than exact ratings.
 */
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({count})</span>
    </div>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Founder, SalesForge",
      quoteKey: "home.testimonials.t1_quote",
      metric: "3% → 11%",
      metricLabelKey: "home.testimonials.reply_rate",
      avatarColor: "bg-emerald-500",
      initials: "AC",
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Growth, PipelineAI",
      quoteKey: "home.testimonials.t2_quote",
      metric: "40%",
      metricLabelKey: "home.testimonials.open_rate",
      avatarColor: "bg-amber-500",
      initials: "MR",
    },
    {
      name: "James Park",
      role: "SDR Manager, DataVault",
      quoteKey: "home.testimonials.t3_quote",
      metric: "8h→30min",
      metricLabelKey: "home.testimonials.time_saved",
      avatarColor: "bg-indigo-500",
      initials: "JP",
    },
    {
      name: "Sarah Okafor",
      role: "VP Sales, Meridian",
      quoteKey: "home.testimonials.t4_quote",
      metric: "2.3x",
      metricLabelKey: "home.testimonials.meetings_booked",
      avatarColor: "bg-rose-500",
      initials: "SO",
    },
    {
      name: "David Kim",
      role: "CEO, NicheFlow",
      quoteKey: "home.testimonials.t5_quote",
      metric: "14%",
      metricLabelKey: "home.testimonials.conversion_rate",
      avatarColor: "bg-purple-500",
      initials: "DK",
    },
    {
      name: "Anna Lindberg",
      role: "CMO, BrightPath",
      quoteKey: "home.testimonials.t6_quote",
      metricKey: "home.testimonials.t6_metric",
      avatarColor: "bg-teal-500",
      initials: "AL",
    },
  ];

  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-copper/3 to-amber-200/3 blur-3xl"
          animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 px-4 py-1.5 rounded-full bg-muted/50 border border-border"
          >
            {t("home.testimonials.label")}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4"
          >
            {t("home.testimonials.title")}{" "}
            <span className="text-copper">{t("home.testimonials.highlight")}</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          >
            {t("home.testimonials.description")}
          </motion.p>
        </motion.div>

        {/* Testimonial grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              variants={fadeUp}
              custom={i * 0.06}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-copper/30 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-copper/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Quote */}
              <div className="relative z-10 flex-1">
                <span className="text-4xl leading-none text-copper/20 font-serif absolute -top-2 -left-1 select-none">
                  &ldquo;
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed pl-5 pt-2">
                  {t(testimonial.quoteKey)}
                </p>
              </div>

              {/* Metric */}
              <div className="relative z-10 bg-muted/50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-[11px] text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-copper leading-none">{testimonial.metric}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    {testimonial.metricLabelKey ? t(testimonial.metricLabelKey) : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">{t("home.testimonials.cta_text")}</p>
          <motion.a
            href={`/sign-up`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-copper text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("home.testimonials.cta_button")}
            <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
