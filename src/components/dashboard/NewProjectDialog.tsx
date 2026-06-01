import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock, ExternalLink, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { Plan, PLAN_LIMITS } from "@/lib/auth/plans";
import Link from "next/link";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { useTranslation } from "@/components/I18nProvider";

export interface NewProjectData {
  name: string;
  company: string;
  goal: string;
  tone: string;
  deadline: Date | undefined;
}

export function NewProjectDialog({ open, onClose, onCreate, userPlan }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewProjectData) => void;
  userPlan: Plan;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Direct, data-first");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");
  const { t } = useTranslation();

  const limits = PLAN_LIMITS[userPlan];

  const handleLinkedinImport = async () => {
    if (!linkedinUrl.trim()) return;
    setLinkedinLoading(true);
    setLinkedinError("");
    try {
      const res = await fetch("/api/prospects/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl: linkedinUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch LinkedIn profile");
      if (data.profile) {
        if (data.profile.full_name) setName(data.profile.full_name);
        if (data.profile.company) setCompany(data.profile.company);
        if (data.profile.headline) setGoal(data.profile.headline.slice(0, 200));
        posthog.capture("linkedin_import_success", { has_name: !!data.profile.full_name, has_company: !!data.profile.company });
      }
      setLinkedinUrl("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setLinkedinError(msg);
    } finally {
      setLinkedinLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture('project_created', {
      prospect_company: company,
      campaign_tone: tone,
      has_deadline: !!deadline,
    });
    onCreate({ name, company, goal, tone, deadline });
    setName(""); setCompany(""); setGoal(""); setDeadline(undefined); setLinkedinUrl("");
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-border"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-muted-foreground hover:text-muted-foreground">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-copper/10 grid place-items-center">
                <Sparkles size={18} className="text-copper" />
              </div>
              <div>
                <h2 className="font-display text-[22px] text-foreground">New Project</h2>
                <p className="text-[12px] text-muted-foreground">
                  {userPlan === "FREE" 
                    ? "Deploy one agent on a new prospect" 
                    : `Deploy ${limits.maxAgents} agents on a new prospect`}
                </p>
              </div>
            </div>
            <div className="border-t border-border my-5" />
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Prospect</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="J. Chen"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground outline-none focus:border-copper text-[13px] placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Company</label>
                  <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Arcadia Finance"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground outline-none focus:border-copper text-[13px] placeholder:text-muted-foreground" />
                </div>
              </div>

              {/* LinkedIn Import */}
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-blue-600" />
                  <span className="text-[11px] font-semibold text-blue-700">{t("linkedin.import_title") || "Import from LinkedIn"}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={linkedinUrl}
                    onChange={(e) => { setLinkedinUrl(e.target.value); setLinkedinError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLinkedinImport(); } }}
                    placeholder={t("linkedin.url_placeholder") || "https://linkedin.com/in/username"}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-white border border-blue-200 text-foreground outline-none focus:border-blue-400 text-[12px] placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    disabled={linkedinLoading || !linkedinUrl.trim()}
                    onClick={handleLinkedinImport}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {linkedinLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ExternalLink size={12} />
                    )}
                    {t("linkedin.import_button") || "Import"}
                  </button>
                </div>
                {linkedinError && (
                  <p className="text-[10px] text-red-500">{linkedinError}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Campaign Goal</label>
                <textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
                  placeholder="Book a 20-min discovery call about treasury automation."
                  className="mt-1 w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground outline-none focus:border-copper text-[13px] resize-none placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Tone</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Direct, data-first", "Warm, consultative", "Bold, contrarian", "Quiet authority"].map((t) => (
                    <button type="button" key={t} onClick={() => setTone(t)}
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                        tone === t ? "border-copper text-copper bg-copper/10" : "border-gray-300 text-muted-foreground hover:text-foreground"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Deadline (optional)</label>
                <div className="mt-1">
                  <DeadlinePicker value={deadline} onChange={setDeadline} />
                </div>
              </div>

              {userPlan === "FREE" && (
                <div className="p-3 rounded-lg bg-copper/10 border border-copper/20 flex items-start gap-3">
                  <Lock size={14} className="text-copper mt-0.5" />
                  <div>
                    <p className="text-[11px] text-copper font-bold uppercase tracking-wider">Plan Free Limited</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Planul FREE folosește un singur agent (Researcher) și modelul GPT-4o-mini. 
                      <Link href="/pricing" className="ml-1 text-copper underline">Upgrade pentru 4 agenți paraleli.</Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-gray-300 text-muted-foreground hover:text-foreground text-[13px] hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-md bg-copper text-white font-medium text-[13px] hover:bg-copper/80">
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
