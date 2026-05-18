"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Lightbulb, Trash2, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Idea = { id: string; title: string; body: string | null; tag: string | null; created_at: string };

const TAGS = ["Hook", "Subject line", "Angle", "Follow-up", "Research"];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string>(TAGS[0] || "Hook");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
    setIdeas((data as Idea[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      await load();
    };
    init();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("ideas").insert({ title, body, tag, user_id: user.id });
    setTitle(""); setBody(""); setTag(TAGS[0] || "Hook");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("ideas").delete().eq("id", id);
    setIdeas((cur) => cur.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-2 font-mono">{"// Capture"}</div>
          <h1 className="font-display text-[40px] leading-[1.05]">Ideas</h1>
          <p className="text-cream/50 mt-2 text-[14px]">Rough thoughts. Subject lines. Angles. Aurelius can shape them later.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 border border-copper text-copper rounded-md text-[12px] tracking-wider uppercase flex items-center gap-2 hover:bg-copper/10 transition-colors"
        >
          <Plus size={14} /> New Idea
        </button>
      </div>

      <div className="copper-streak mt-8" />

      {loading ? (
        <div className="mt-16 text-center text-cream/40 text-sm">Loading…</div>
      ) : ideas.length === 0 ? (
        <div className="mt-20 text-center">
            <Lightbulb size={36} className="text-copper mx-auto opacity-60" />
            <p className="font-display text-[22px] mt-4">Your first spark goes here.</p>
            <p className="text-cream/50 text-[13px] mt-2">Click &quot;New Idea&quot; to capture it.</p>
          </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-deep p-5 group relative luxury-shadow">
              <div className="flex items-center justify-between">
                {idea.tag && (
                  <span className="text-[10px] tracking-widest uppercase text-copper flex items-center gap-1">
                    <Tag size={10} /> {idea.tag}
                  </span>
                )}
                <button onClick={() => remove(idea.id)} className="opacity-0 group-hover:opacity-100 text-cream/40 hover:text-copper transition-opacity">
                  <Trash2 size={13} />
                </button>
              </div>
              <h3 className="font-display text-[18px] mt-2 leading-snug">{idea.title}</h3>
              {idea.body && <p className="text-[13px] text-cream/70 mt-2 leading-relaxed whitespace-pre-wrap">{idea.body}</p>}
              <div className="text-[10px] text-cream/40 mt-4 font-mono">
                {new Date(idea.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-full max-w-md glass-deep p-7"
            >
              <h2 className="font-display text-[22px]">New Idea</h2>
              <div className="copper-streak my-4" />
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-widest text-cream/40 uppercase">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lead with the failed launch — empathy + credibility"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-copper/20 text-cream outline-none focus:border-copper text-[13px]" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-cream/40 uppercase">Notes</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-copper/20 text-cream outline-none focus:border-copper text-[13px] resize-none" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-cream/40 uppercase">Tag</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAGS.map((t) => (
                      <button type="button" key={t} onClick={() => setTag(t)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border ${
                          tag === t ? "border-copper text-copper bg-copper/10" : "border-copper/20 text-cream/50"
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-md border border-copper/20 text-cream/70 text-[13px]">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-md bg-copper text-obsidian font-medium text-[13px]">Save</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
