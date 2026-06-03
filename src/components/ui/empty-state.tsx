"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════
   EMPTY STATE PATTERN
   ════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  /** Large icon above Aurelius message (48px, decorative) */
  icon?: React.ReactNode;
  /** Aurelius message — must be specific to context */
  message: string;
  /** Primary CTA label */
 ctaLabel?: string;
  /** Primary CTA action */
  onCtaClick?: () => void;
  /** Primary CTA href (alternative to onClick) */
  ctaHref?: string;
  /** Secondary text link label */
  secondaryLabel?: string;
  /** Secondary text link action */
  onSecondaryClick?: () => void;
  /** Secondary text link href */
  secondaryHref?: string;
  /** Extra className */
  className?: string;
}

export function EmptyState({
  icon,
  message,
  ctaLabel,
  onCtaClick,
  ctaHref,
  secondaryLabel,
  onSecondaryClick,
  secondaryHref,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const CtaTag = ctaHref ? "a" : "button";
  const ctaProps = ctaHref ? { href: ctaHref } : { onClick: onCtaClick };
  const SecondaryTag = secondaryHref ? "a" : "button";
  const secondaryProps = secondaryHref ? { href: secondaryHref } : { onClick: onSecondaryClick };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
      className={cn("flex flex-col items-center justify-center text-center px-6 py-12", className)}
    >
      {/* Large icon (optional) */}
      {icon && (
        <div className="mb-4 text-muted-foreground/30" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Aurelius avatar + message */}
      <div className="max-w-sm">
        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-3">
          <span className="text-amber-700 dark:text-amber-300 text-xs font-bold">Au</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {message}
        </p>
      </div>

      {/* Primary CTA */}
      {ctaLabel && (
  <CtaTag
    {...(ctaProps as any)}
    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-bold hover:bg-copper/80 transition-all shadow-sm"
  >
    {ctaLabel}
    <ArrowRight size={14} />
  </CtaTag>
)}

      {/* Secondary link */}
      {secondaryLabel && (
        <SecondaryTag
          {...(secondaryProps as any)}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          {secondaryLabel}
        </SecondaryTag>
      )}
    </motion.div>
  );
}
