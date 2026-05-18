import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock } from "lucide-react";
import posthog from "posthog-js";
import { Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import Link from "next/link";

export function NewProjectDialog({ open, onClose, onCreate, userPlan }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; company: string; goal: string; tone: string }) => void;
  userPlan: Plan;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Direct, data-first");

  const limits = PLAN_LIMITS[userPlan];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture('project_created', {
      prospect_company: company,
      outreach_tone: tone,
    });
    onCreate({ name, company, goal, tone });
    setName(""); setCompany(""); setGoal("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg glass-deep p-8"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-cream-50 hover:text-cream">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[rgba(193,123,63,0.15)] grid place-items-center">
                <Sparkles size={18} className="text-[var(--copper)]" />
              </div>
              <div>
                <h2 className="font-display text-[22px]">New Project</h2>
                <p className="text-[12px] text-cream-50">
                  {userPlan === "FREE" 
                    ? "Deploy one agent on a new prospect" 
                    : `Deploy ${limits.maxAgents} agents on a new prospect`}
                </p>
              </div>
            </div>
            <div className="copper-streak my-5" />
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-widest text-cream-40 uppercase">Prospect</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="J. Chen"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-[rgba(193,123,63,0.2)] text-cream outline-none focus:border-[var(--copper)] text-[13px]" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-cream-40 uppercase">Company</label>
                  <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Arcadia Finance"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-[rgba(193,123,63,0.2)] text-cream outline-none focus:border-[var(--copper)] text-[13px]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-cream-40 uppercase">Goal of outreach</label>
                <textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
                  placeholder="Book a 20-min discovery call about treasury automation."
                  className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-[rgba(193,123,63,0.2)] text-cream outline-none focus:border-[var(--copper)] text-[13px] resize-none" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-cream-40 uppercase">Tone</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Direct, data-first", "Warm, consultative", "Bold, contrarian", "Quiet authority"].map((t) => (
                    <button type="button" key={t} onClick={() => setTone(t)}
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                        tone === t ? "border-[var(--copper)] text-[var(--copper)] bg-[rgba(193,123,63,0.08)]" : "border-[rgba(193,123,63,0.2)] text-cream-50 hover:text-cream"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {userPlan === "FREE" && (
                <div className="p-3 rounded-lg bg-copper/10 border border-copper/20 flex items-start gap-3">
                  <Lock size={14} className="text-copper mt-0.5" />
                  <div>
                    <p className="text-[11px] text-copper font-bold uppercase tracking-wider">Plan Free Limited</p>
                    <p className="text-[10px] text-cream/60 leading-relaxed">
                      Planul FREE folosește un singur agent (Researcher) și modelul GPT-4o-mini. 
                      <Link href="/pricing" className="ml-1 text-copper underline">Upgrade pentru 4 agenți paraleli.</Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-[rgba(193,123,63,0.2)] text-cream-70 hover:text-cream text-[13px]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-md bg-[var(--copper)] text-[var(--obsidian)] font-medium text-[13px] hover:bg-[var(--copper-light)]">
                  Deploy agents →
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
