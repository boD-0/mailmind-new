"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Loader2, Plus, Coins } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/components/I18nProvider";
import { getSwarmUsage, type SwarmUsage } from "@/app/actions/swarm-usage";
import { getSwarmCredits, type SwarmCredits } from "@/app/actions/swarm-credits";
import { toast } from "sonner";

export function SwarmUsageBar() {
  const { locale } = useParams();
  const l = locale as string;
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [usage, setUsage] = useState<SwarmUsage | null>(null);
  const [credits, setCredits] = useState<SwarmCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const refreshCredits = () => {
    getSwarmCredits().then(setCredits).catch(() => {});
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSwarmUsage(), getSwarmCredits()])
      .then(([usageData, creditsData]) => {
        if (!cancelled) {
          setUsage(usageData);
          setCredits(creditsData);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle success redirect from Stripe credit purchase
  useEffect(() => {
    const purchased = searchParams.get("credits_purchased");
    if (purchased) {
      const qty = parseInt(purchased, 10);
      if (!isNaN(qty) && qty > 0) {
        toast.success(t("dashboard.credits_purchase_success", { count: qty * 10 }));
        refreshCredits();
        // Clean up the query param to prevent duplicate toasts on refresh
        router.replace(window.location.pathname);
      }
    }
  }, [searchParams, t, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!usage) return null;

  const { used, maxExecutions, isUnlimited, percentage } = usage;

  // Color state based on usage
  const colorClass =
    isUnlimited
      ? "from-emerald-400 to-teal-400"
      : percentage >= 90
        ? "from-red-500 to-rose-500"
        : percentage >= 75
          ? "from-amber-400 to-orange-500"
          : "from-copper to-amber-400";

  const textColor =
    isUnlimited
      ? "text-emerald-600"
      : percentage >= 90
        ? "text-red-500"
        : percentage >= 75
          ? "text-amber-600"
          : "text-copper";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-border p-3 shadow-sm"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className={textColor} />
          <span className="text-xs font-semibold text-foreground">
            {t("dashboard.swarm_usage_title")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isUnlimited ? (
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {t("dashboard.swarm_usage_unlimited")}
            </span>
          ) : (
            <>
              <span className={`text-xs font-bold ${textColor} tabular-nums`}>                  {used}
                  <span className="text-muted-foreground font-normal">/{maxExecutions}</span>
              </span>
              {percentage >= 90 && (
                <Link
                  href={`/${l}/pricing`}
                  className="text-[10px] font-medium text-copper hover:underline"
                >
                  <TrendingUp size={11} className="inline mr-0.5" />
                  {t("dashboard.swarm_usage_upgrade")}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${isUnlimited ? 100 : percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Sparkle on leading edge */}
        {!isUnlimited && percentage > 0 && percentage < 100 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-amber-400 shadow-sm z-10"
            initial={{ left: "0%" }}
            animate={{ left: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>

      {/* Sub-label */}
      <p className="text-[10px] text-muted-foreground mt-1.5">
        {isUnlimited
          ? t("dashboard.swarm_usage_unlimited_desc")
          : t("dashboard.swarm_usage_remaining", { count: Math.max(0, maxExecutions - used) })}
      </p>

      {/* Credits section (only for limited plans) */}
      {!isUnlimited && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins size={12} className="text-amber-500" />
            <span className="text-[11px] text-muted-foreground">
              {t("dashboard.credits_extra")}:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {credits?.balance ?? 0}
              </span>
            </span>
          </div>
          <button
            onClick={async () => {
              if (buying) return;
              setBuying(true);
              try {
                const res = await fetch("/api/stripe/credits/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ quantity: 1 }),
                });
                const data = await res.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  toast.error(data.error || "Something went wrong.");
                  setBuying(false);
                }
              } catch {
                toast.error("Something went wrong.");
                setBuying(false);
              }
            }}
            disabled={buying}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buying ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Plus size={10} />
            )}
            {t("dashboard.credits_buy")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
