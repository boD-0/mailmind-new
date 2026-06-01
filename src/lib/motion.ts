import type { Transition, Variants } from "framer-motion"

// ── Spring Physics Presets ─────────────────────────────────────────────────
// Usage: <motion.div transition={springs.gentle} />

export const springs = {
  /** Fast, snappy response — buttons, toggles, micro-interactions */
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 35,
    mass: 0.5,
  } satisfies Transition,

  /** Default gentle spring — modals, cards, page transitions */
  gentle: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,

  /** Slow, luxurious spring — hero elements, large reveals */
  bouncy: {
    type: "spring",
    stiffness: 200,
    damping: 20,
    mass: 1,
  } satisfies Transition,

  /** Almost no bounce — subtle opacity/scale transitions */
  subtle: {
    type: "spring",
    stiffness: 200,
    damping: 35,
    mass: 1,
  } satisfies Transition,

  /** Heavy, authoritative — for emphasis animations */
  heavy: {
    type: "spring",
    stiffness: 150,
    damping: 15,
    mass: 1.2,
  } satisfies Transition,
} as const

// ── Timed Transitions ──────────────────────────────────────────────────────

export const transitions = {
  /** 150ms — instant feedback */
  instant: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } satisfies Transition,

  /** 300ms — standard UI transitions */
  default: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } satisfies Transition,

  /** 500ms — page transitions, larger elements */
  slow: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } satisfies Transition,

  /** 800ms — hero reveals, cinematic moments */
  cinematic: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } satisfies Transition,
} as const

// ── Press Scale Config ─────────────────────────────────────────────────────
// Usage: whileTap="press" or whileHover="hover"
// Add to your variants or use directly: whileTap={{ scale: pressScale }}

export const pressScale = 0.97

// ── Reusable Variants ──────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}
