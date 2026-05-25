"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

/**
 * Trial banner that reads trial status directly from better-auth's session.
 *
 * On signup, the `databaseHooks.user.create.before` hook sets:
 *   - plan = "PROFESSIONAL"
 *   - trialEnd = 14 days from now
 *
 * The TrialBanner computes `isTrialing` and `daysRemaining` client-side
 * from the session's `trialEnd` and `plan` fields, so no server round-trip is needed.
 */
export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { data: session } = authClient.useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const trialEndRaw = user?.trialEnd as string | null | undefined;
  const plan = (user?.plan as string) || "FREE";
  const polarSubscriptionId = user?.polarSubscriptionId as string | null | undefined;

  const now = Date.now();
  const trialEnd = trialEndRaw ? new Date(trialEndRaw).getTime() : null;
  // Only show banner for free trial users, not paying subscribers
  const isTrialing =
    plan === "PROFESSIONAL" && trialEnd !== null && trialEnd > now && !polarSubscriptionId;
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)))
    : 0;

  if (!isTrialing || dismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const isWarning = daysRemaining <= 7 && daysRemaining > 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div
          className={`relative flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium rounded-xl border shadow-sm ${
            isUrgent
              ? "bg-red-50 border-red-200 text-red-800"
              : isWarning
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-indigo-50 border-indigo-200 text-indigo-800"
          }`}
        >
          {/* Animated sparkle icon */}
          <motion.span
            animate={isUrgent ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: isUrgent ? Infinity : 0 }}
            className="shrink-0"
          >
            {isUrgent ? (
              <Crown size={16} className="text-red-500" />
            ) : (
              <Sparkles size={16} className={isWarning ? "text-amber-500" : "text-indigo-500"} />
            )}
          </motion.span>

          {/* Trial message */}
          <div className="flex-1 min-w-0">
            <span className="font-semibold">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
            </span>
            <span className="opacity-80">
              {" "}in your Professional trial.
              {daysRemaining <= 3 && " Don't lose access!"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${locale}/pricing`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                isUrgent
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : isWarning
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Upgrade now
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>

          {/* Progress bar at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 rounded-full"
            style={{
              width: `${Math.max(0, (daysRemaining / 14) * 100)}%`,
              background: isUrgent
                ? "linear-gradient(90deg, #ef4444, #f97316)"
                : isWarning
                  ? "linear-gradient(90deg, #f59e0b, #f97316)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(0, (daysRemaining / 14) * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
