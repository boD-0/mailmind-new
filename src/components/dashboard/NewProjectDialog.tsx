import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock } from "lucide-react";
import posthog from "posthog-js";
import { Plan, PLAN_LIMITS } from "@/lib/auth/gatekeeper";
import Link from "next/link";
import { DeadlinePicker } from "@/components/ui/deadline-picker";

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

  const limits = PLAN_LIMITS[userPlan];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture('project_created', {
      prospect_company: company,
      outreach_tone: tone,
      has_deadline: !!deadline,
    });
    onCreate({ name, company, goal, tone, deadline });
    setName(""); setCompany(""); setGoal(""); setDeadline(undefined);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#ff5f5f]/10 grid place-items-center">
                <Sparkles size={18} className="text-[#ff5f5f]" />
              </div>
              <div>
                <h2 className="font-display text-[22px] text-gray-900">New Project</h2>
                <p className="text-[12px] text-gray-500">
                  {userPlan === "FREE" 
                    ? "Deploy one agent on a new prospect" 
                    : `Deploy ${limits.maxAgents} agents on a new prospect`}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 my-5" />
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-widest text-gray-400 uppercase">Prospect</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="J. Chen"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-[#ff5f5f] text-[13px] placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-gray-400 uppercase">Company</label>
                  <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Arcadia Finance"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-[#ff5f5f] text-[13px] placeholder:text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-gray-400 uppercase">Goal of outreach</label>
                <textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
                  placeholder="Book a 20-min discovery call about treasury automation."
                  className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-[#ff5f5f] text-[13px] resize-none placeholder:text-gray-400" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-gray-400 uppercase">Tone</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Direct, data-first", "Warm, consultative", "Bold, contrarian", "Quiet authority"].map((t) => (
                    <button type="button" key={t} onClick={() => setTone(t)}
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                        tone === t ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10" : "border-gray-300 text-gray-500 hover:text-gray-800"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest text-gray-400 uppercase">Deadline (optional)</label>
                <div className="mt-1">
                  <DeadlinePicker value={deadline} onChange={setDeadline} />
                </div>
              </div>

              {userPlan === "FREE" && (
                <div className="p-3 rounded-lg bg-[#ff5f5f]/10 border border-[#ff5f5f]/20 flex items-start gap-3">
                  <Lock size={14} className="text-[#ff5f5f] mt-0.5" />
                  <div>
                    <p className="text-[11px] text-[#ff5f5f] font-bold uppercase tracking-wider">Plan Free Limited</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Planul FREE folosește un singur agent (Researcher) și modelul GPT-4o-mini. 
                      <Link href="/pricing" className="ml-1 text-[#ff5f5f] underline">Upgrade pentru 4 agenți paraleli.</Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-gray-300 text-gray-600 hover:text-gray-800 text-[13px] hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-md bg-[#ff5f5f] text-white font-medium text-[13px] hover:bg-red-500">
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
