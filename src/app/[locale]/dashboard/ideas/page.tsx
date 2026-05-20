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
          <div className="text-[11px] tracking-[0.25em] text-[#ff5f5f] uppercase mb-2 font-mono">{"// Capture"}</div>
          <h1 className="font-display text-[40px] leading-[1.05] text-gray-900">Ideas</h1>
          <p className="text-gray-400 mt-2 text-[14px]">Rough thoughts. Subject lines. Angles. Aurelius can shape them later.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 border border-[#ff5f5f] text-[#ff5f5f] rounded-md text-[12px] tracking-wider uppercase flex items-center gap-2 hover:bg-[#ff5f5f]/10 transition-colors"
        >
          <Plus size={14} /> New Idea
        </button>
      </div>

      <div className="copper-streak mt-8" />

      {loading ? (
        <div className="mt-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : ideas.length === 0 ? (
        <div className="mt-20 text-center">
            <Lightbulb size={36} className="text-[#ff5f5f] mx-auto opacity-60" />
            <p className="font-display text-[22px] mt-4 text-gray-900">Your first spark goes here.</p>
            <p className="text-gray-400 text-[13px] mt-2">Click &quot;New Idea&quot; to capture it.</p>
          </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-deep p-5 group relative">
              <div className="flex items-center justify-between">
                {idea.tag && (
                  <span className="text-[10px] tracking-widest uppercase text-[#ff5f5f] flex items-center gap-1">
                    <Tag size={10} /> {idea.tag}
                  </span>
                )}
                <button onClick={() => remove(idea.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#ff5f5f] transition-opacity">
                  <Trash2 size={13} />
                </button>
              </div>
              <h3 className="font-display text-[18px] mt-2 leading-snug text-gray-900">{idea.title}</h3>
              {idea.body && <p className="text-[13px] text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{idea.body}</p>}
              <div className="text-[10px] text-gray-400 mt-4 font-mono">
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
              onClick={() => setOpen(false)} className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-full max-w-md bg-white p-7 rounded-2xl shadow-xl border border-gray-200"
            >
              <h2 className="font-display text-[22px] text-gray-900">New Idea</h2>
              <div className="copper-streak my-4" />
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-widest text-gray-400 uppercase">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lead with the failed launch — empathy + credibility"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-[#ff5f5f] text-[13px] placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-gray-400 uppercase">Notes</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-[#ff5f5f] text-[13px] resize-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-gray-400 uppercase">Tag</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAGS.map((t) => (
                      <button type="button" key={t} onClick={() => setTag(t)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border ${
                          tag === t ? "border-[#ff5f5f] text-[#ff5f5f] bg-[#ff5f5f]/10" : "border-gray-200 text-gray-400"
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-md border border-gray-200 text-gray-600 text-[13px] hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-md bg-[#ff5f5f] text-white font-medium text-[13px] hover:bg-red-500">Save</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
