"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, Lock } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ChecklistItem {
  id: string;
  labelKey: string;
  href: string;
  completed: boolean;
  unlocked: boolean;
  feature: string;
}

export function OnboardingChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslation();
  const { locale } = useParams();

  useEffect(() => {
    // In a real implementation, this would come from getUserWithPlan()
    // checking onboardingComplete, firstSwarmLaunched, vaultUploaded etc.
    // For now, fetch from a dedicated endpoint
    async function load() {
      try {
        const res = await fetch("/api/user/progress");
        if (res.ok) {
          const data = await res.json();
          const checklist: ChecklistItem[] = [
            {
              id: "profile",
              labelKey: "checklist.profile",
              href: `/${locale}/dashboard/settings`,
              completed: data.onboardingComplete || false,
              unlocked: true,
              feature: t("checklist.feature_profile") || "Personalization",
            },
            {
              id: "swarm",
              labelKey: "checklist.swarm",
              href: `/${locale}/dashboard`,
              completed: data.firstSwarm || false,
              unlocked: data.onboardingComplete || false,
              feature: t("checklist.feature_swarm") || "Swarm Execution",
            },
            {
              id: "vault",
              labelKey: "checklist.vault",
              href: `/${locale}/dashboard/war-room/0`,
              completed: data.vaultUsed || false,
              unlocked: data.firstSwarm || false,
              feature: t("checklist.feature_vault") || "Vault Upload",
            },
            {
              id: "warroom",
              labelKey: "checklist.warroom",
              href: `/${locale}/dashboard/tools`,
              completed: data.warRoomUsed || false,
              unlocked: data.vaultUsed || false,
              feature: t("checklist.feature_warroom") || "War Room",
            },
          ];
          setItems(checklist);
        }
      } catch {
        // Default items all unlocked
        setItems([
          { id: "profile", labelKey: "checklist.profile", href: `/${locale}/dashboard/settings`, completed: true, unlocked: true, feature: "Profile" },
          { id: "swarm", labelKey: "checklist.swarm", href: `/${locale}/dashboard`, completed: false, unlocked: true, feature: "Swarm" },
          { id: "vault", labelKey: "checklist.vault", href: `/${locale}/dashboard/war-room/0`, completed: false, unlocked: true, feature: "Vault" },
          { id: "warroom", labelKey: "checklist.warroom", href: `/${locale}/dashboard/tools`, completed: false, unlocked: true, feature: "War Room" },
        ]);
      }
    }
    load();
  }, [t, locale]);

  const completedCount = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allDone = completedCount === total && total > 0;

  if (allDone) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-700">
            {t("checklist.title") || "Getting Started"} ({completedCount}/{total})
          </span>
        </div>
        <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={14} className="text-amber-400" />
        </motion.span>
      </button>

      {/* Progress bar */}
      <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.unlocked ? item.href : "#"}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                    item.unlocked
                      ? "hover:bg-amber-100/50"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!item.unlocked) e.preventDefault();
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed
                        ? "bg-emerald-400 text-white"
                        : item.unlocked
                          ? "bg-amber-200 text-amber-600"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {item.completed ? (
                      <Check size={11} />
                    ) : item.unlocked ? (
                      <span className="text-[10px] font-bold">{items.findIndex((i) => i.id === item.id) + 1}</span>
                    ) : (
                      <Lock size={9} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium truncate ${
                      item.completed ? "text-emerald-700 line-through" : "text-amber-800"
                    }`}>
                      {t(item.labelKey) || item.labelKey}
                    </p>
                    {item.completed && (
                      <p className="text-[9px] text-emerald-500">
                        ✓ {item.feature} {t("checklist.unlocked") || "unlocked"}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
