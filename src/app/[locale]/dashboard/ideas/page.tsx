"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Lightbulb, Trash2, Tag, Search, Sparkles, Rocket, X } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();

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

  const handleLaunchSwarm = async (idea: Idea) => {
    setLaunchingId(idea.id);
    try {
      // Create a campaign from the idea
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prospectName = idea.title;
      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          title: idea.title,
          prospect_name: prospectName,
          status: "draft",
          swarm_params: { tone_aggressiveness: "Direct, data-first" },
          confidence_score: 0,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Navigate to the war room for this campaign
      router.push(`/${locale}/dashboard/war-room/${campaign.id}`);
    } catch (err) {
      console.error("Failed to launch swarm from idea:", err);
    } finally {
      setLaunchingId(null);
    }
  };

  // Local search filter
  const filteredIdeas = search.trim().length >= 2
    ? ideas.filter((idea) => {
        const q = search.toLowerCase();
        return (
          idea.title.toLowerCase().includes(q) ||
          (idea.body?.toLowerCase().includes(q) ?? false) ||
          (idea.tag?.toLowerCase().includes(q) ?? false)
        );
      })
    : ideas;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] tracking-[0.25em] text-copper uppercase mb-2 font-mono">{"// Capture"}</div>
          <h1 className="font-display text-[40px] leading-[1.05] text-foreground">Ideas</h1>
          <p className="text-muted-foreground mt-2 text-[14px]">Rough thoughts. Subject lines. Angles. Aurelius can shape them later.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 border border-copper text-copper rounded-md text-[12px] tracking-wider uppercase flex items-center gap-2 hover:bg-copper/10 transition-colors"
        >
          <Plus size={14} /> New Idea
        </button>
      </div>

      <div className="copper-streak mt-8" />

      {/* Search bar */}
      {ideas.length > 0 && (
        <div className="relative mt-6 mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas by title, content, or tag..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm outline-none focus:border-copper/50 transition-colors placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-16 text-center text-muted-foreground text-sm">Loading…</div>
      ) : ideas.length === 0 ? (
        <div className="mt-20 text-center">
            <Lightbulb size={36} className="text-copper mx-auto opacity-60" />
            <p className="font-display text-[22px] mt-4 text-foreground">Your first spark goes here.</p>
            <p className="text-muted-foreground text-[13px] mt-2">Click &quot;New Idea&quot; to capture it.</p>
          </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="mt-20 text-center">
          <Search size={36} className="text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-display text-[22px] text-foreground">No matches for &quot;{search}&quot;</p>
          <p className="text-muted-foreground text-[13px] mt-2">Try a different search term or clear the filter.</p>
        </div>
      ) : (
        <>
          {search && (
            <p className="text-[11px] text-muted-foreground mt-2 mb-2">
              {filteredIdeas.length} of {ideas.length} ideas
            </p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="glass-deep p-5 group relative">
                <div className="flex items-center justify-between">
                  {idea.tag && (
                    <span className="text-[10px] tracking-widest uppercase text-copper flex items-center gap-1">
                      <Tag size={10} /> {idea.tag}
                    </span>
                  )}
                  <button onClick={() => remove(idea.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-copper transition-opacity">
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className="font-display text-[18px] mt-2 leading-snug text-foreground">{idea.title}</h3>
                {idea.body && <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{idea.body}</p>}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleLaunchSwarm(idea)}
                    disabled={launchingId === idea.id}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-copper hover:bg-copper/10 transition-all disabled:opacity-50"
                    title="Create campaign from this idea"
                  >
                    {launchingId === idea.id ? (
                      <span className="animate-spin w-3 h-3 border-2 border-copper border-t-transparent rounded-full" />
                    ) : (
                      <Rocket size={12} />
                    )}
                    Launch Swarm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-full max-w-md bg-white p-7 rounded-2xl shadow-xl border border-border"
            >
              <h2 className="font-display text-[22px] text-foreground">New Idea</h2>
              <div className="copper-streak my-4" />
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lead with the failed launch — empathy + credibility"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground outline-none focus:border-copper text-[13px] placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Notes</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground outline-none focus:border-copper text-[13px] resize-none placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Tag</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAGS.map((t) => (
                      <button type="button" key={t} onClick={() => setTag(t)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border ${
                          tag === t ? "border-copper text-copper bg-copper/10" : "border-border text-muted-foreground"
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-md border border-border text-muted-foreground text-[13px] hover:bg-muted">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-md bg-copper text-white font-medium text-[13px] hover:bg-copper/80">Save</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
