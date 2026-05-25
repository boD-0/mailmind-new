"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, ChevronDown, ExternalLink,
  Mail, Building2, Clock, Loader2, Trash2,
} from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";
import { listProspects, deleteProspect } from "@/app/actions/prospects";
import type { ProspectData } from "@/app/actions/prospects";

// ─── Module-level constants ─────────────────────────────────────────────────

const OCEANO_LABELS: Record<string, string> = {
  openness: "O",
  conscientiousness: "C",
  extraversion: "E",
  agreeableness: "A",
  neuroticism: "N",
};

const OCEANO_COLORS: Record<string, string> = {
  openness: "#8b5cf6",
  conscientiousness: "#3b82f6",
  extraversion: "#f59e0b",
  agreeableness: "#10b981",
  neuroticism: "#ef4444",
};

const SEARCH_DEBOUNCE_MS = 300;

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onSelectProspect?: (prospect: ProspectData) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProspectsList({ onSelectProspect }: Props) {
  const [prospects, setProspects] = useState<ProspectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();

  const fetchProspects = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const result = await listProspects(query || undefined);
      setProspects(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search — fires 300ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProspects(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchProspects]);

  // Initial load
  useEffect(() => {
    fetchProspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProspect(id);
      setProspects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-copper" />
          <h3 className="text-sm font-bold tracking-tight">
            {t("prospects.title") || "Prospect Database"}
          </h3>
          {!loading && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {prospects.length}
            </span>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("prospects.search") || "Search prospects..."}
          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-copper/30 focus:border-copper/50 transition-colors"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && prospects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-xl border border-dashed border-gray-200 p-6 text-center"
        >
          <Users size={24} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground">
            {t("prospects.empty") || "No prospects yet"}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {t("prospects.empty_hint") || "Prospects are saved automatically after each Swarm campaign"}
          </p>
        </motion.div>
      )}

      {/* List */}
      <AnimatePresence>
        {prospects.map((p, i) => {
          const isExpanded = expandedId === p.id;
          const hasOceano = p.oceanoScores && Object.values(p.oceanoScores).some((v) => v > 0);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              {/* Summary row */}
              <button
                onClick={() => {
                  setExpandedId(isExpanded ? null : p.id);
                  if (onSelectProspect && !isExpanded) onSelectProspect(p);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {p.name}
                    </span>
                    {p.company && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                        {p.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.email && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Mail size={9} />
                        {p.email}
                      </span>
                    )}
                    {p.lastContactedAt && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(p.lastContactedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini OCEAN bars */}
                {hasOceano && (
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    {Object.entries(OCEANO_LABELS).map(([key, label]) => {
                      const score = p.oceanoScores?.[key as keyof typeof p.oceanoScores] ?? 0;
                      return (
                        <div key={key} className="flex flex-col items-center gap-0.5">
                          <div className="w-1.5 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                            <motion.div
                              className="absolute bottom-0 w-full rounded-full"
                              style={{ background: OCEANO_COLORS[key] }}
                              initial={{ height: "0%" }}
                              animate={{ height: `${Math.max(score, 5)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                          </div>
                          <span className="text-[8px] text-muted-foreground/50">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-muted-foreground" />
                </motion.span>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-4 pt-1 border-t border-border space-y-3">
                      {/* Contact details */}
                      <div className="grid grid-cols-2 gap-2">
                        {p.title && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Building2 size={11} />
                            {p.title}
                          </div>
                        )}
                        {p.linkedinUrl && (
                          <a
                            href={p.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={11} />
                            LinkedIn
                          </a>
                        )}
                      </div>

                      {/* Tags */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-copper/10 text-copper px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* OCEAN full */}
                      {hasOceano && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("prospects.ocean_profile") || "OCEAN Profile"}
                          </p>
                          {Object.entries(OCEANO_LABELS).map(([key]) => {
                            const score = p.oceanoScores?.[key as keyof typeof p.oceanoScores] ?? 0;
                            const names: Record<string, string> = {
                              openness: t("prospects.openness") || "Openness",
                              conscientiousness: t("prospects.conscientiousness") || "Conscientiousness",
                              extraversion: t("prospects.extraversion") || "Extraversion",
                              agreeableness: t("prospects.agreeableness") || "Agreeableness",
                              neuroticism: t("prospects.neuroticism") || "Neuroticism",
                            };
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-28 shrink-0">
                                  {names[key]}
                                </span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: OCEANO_COLORS[key] }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.4 }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">
                                  {score}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Notes */}
                      {p.notes && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            {t("prospects.notes") || "Notes"}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {p.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id, e);
                          }}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={11} />
                          {t("prospects.delete") || "Delete"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
