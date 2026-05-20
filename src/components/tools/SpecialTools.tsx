"use client";

import React, { useState } from "react";
import {
  FlaskConical, Layers, Send, Download, X, Loader2, Sparkles, Copy,
  Wrench, GripVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ToolCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export type { ToolCard };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SPECIAL_TOOLS: ToolCard[] = [
  {
    id: "ab-test",
    label: "A/B Test",
    description: "Generate subject line variants and test them",
    icon: FlaskConical,
    color: "text-purple-500",
  },
  {
    id: "sequence",
    label: "Sequence Builder",
    description: "Build multi-email follow-up sequences",
    icon: Layers,
    color: "text-blue-500",
  },
  {
    id: "send-test",
    label: "Send Test",
    description: "Send a test email to preview rendering",
    icon: Send,
    color: "text-emerald-500",
  },
  {
    id: "export",
    label: "Export Campaign",
    description: "Download campaign data and analytics",
    icon: Download,
    color: "text-amber-500",
  },
];

// ─── SORTABLE STEP ───────────────────────────────────────────────────────────

function SortableStep({ step, index, onDelete }: {
  step: { id: string; title: string; body: string };
  index: number;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 px-2.5 py-2 bg-white rounded-lg border border-gray-200">
      <button {...attributes} {...listeners} className="shrink-0 mt-1 p-0.5 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded transition-colors">
        <GripVertical size={12} className="text-gray-300" />
      </button>
      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-700 truncate">{step.title}</p>
        <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{step.body}</p>
      </div>
      <button onClick={() => onDelete(step.id)}>
        <X size={12} className="text-gray-300 hover:text-red-500" />
      </button>
    </div>
  );
}

// ─── SPECIAL TOOLS ────────────────────────────────────────────────────────────

export function SpecialTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // A/B Test state
  const [abTopic, setAbTopic] = useState("");
  const [abContext, setAbContext] = useState("");
  const [abVariants, setAbVariants] = useState<string[]>([]);
  const [abLoading, setAbLoading] = useState(false);
  const [abError, setAbError] = useState("");

  // Sequence state
  const [sequenceTopic, setSequenceTopic] = useState("");
  const [sequence, setSequence] = useState<{ id: string; title: string; body: string }[]>([]);
  const [sequenceStep, setSequenceStep] = useState("");
  const [seqLoading, setSeqLoading] = useState(false);
  const [seqError, setSeqError] = useState("");

  const [testEmail, setTestEmail] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sequence.findIndex((s) => s.id === active.id);
    const newIndex = sequence.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setSequence(arrayMove(sequence, oldIndex, newIndex));
  };

  const handleToolClick = (id: string) => {
    setActiveTool(activeTool === id ? null : id);
  };

  // ── A/B Test: Generate variants via API ──
  const handleGenerateVariants = async () => {
    if (!abTopic.trim()) return;
    setAbLoading(true);
    setAbError("");
    try {
      const res = await fetch("/api/war-room/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: abTopic.trim(),
          count: 5,
          context: abContext.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate variants");
      setAbVariants(data.variants);
    } catch (err) {
      setAbError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setAbLoading(false);
    }
  };

  // ── Sequence: Generate via API ──
  const handleGenerateSequence = async () => {
    if (!sequenceTopic.trim()) return;
    setSeqLoading(true);
    setSeqError("");
    try {
      const res = await fetch("/api/war-room/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sequenceTopic.trim(),
          steps: 4,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate sequence");
      setSequence(data.sequence.map((s: { title: string; body: string }) => ({ ...s, id: crypto.randomUUID() })));
    } catch (err) {
      setSeqError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setSeqLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={14} className="text-gray-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Special Tools
        </span>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-2 gap-2">
        {SPECIAL_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTool === tool.id
                  ? "bg-[#ff5f5f]/5 border-[#ff5f5f]/30 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Icon size={18} className={`${tool.color} mb-1.5`} />
              <p className="text-[11px] font-bold text-gray-800">{tool.label}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {/* Tool Panels */}
      <AnimatePresence mode="wait">
        {activeTool === "ab-test" && (
          <motion.div
            key="ab-test"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Subject Line A/B Test</p>
              <input
                value={abTopic}
                onChange={(e) => setAbTopic(e.target.value)}
                placeholder="e.g. New product launch — AI analytics"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-xs outline-none focus:border-purple-500 placeholder:text-gray-300"
              />
              <input
                value={abContext}
                onChange={(e) => setAbContext(e.target.value)}
                placeholder="Optional: target audience, tone, key benefit..."
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-xs outline-none focus:border-purple-500 placeholder:text-gray-300"
              />
              <button
                onClick={handleGenerateVariants}
                disabled={abLoading || !abTopic.trim()}
                className="w-full py-1.5 rounded-lg bg-purple-500 text-white text-[10px] font-bold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                {abLoading ? (
                  <><Loader2 size={12} className="animate-spin" /> Generating...</>
                ) : (
                  <><FlaskConical size={12} /> Generate Variants</>
                )}
              </button>
              {abError && (
                <p className="text-[10px] text-red-500 px-1">{abError}</p>
              )}
              {abVariants.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {abVariants.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-2.5 py-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-700"
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1">{v}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(v)}
                        className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy size={10} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTool === "sequence" && (
          <motion.div
            key="sequence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Follow-up Sequence</p>
              <input
                value={sequenceTopic}
                onChange={(e) => setSequenceTopic(e.target.value)}
                placeholder="e.g. Cold outreach for SaaS demo"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-xs outline-none focus:border-blue-500 placeholder:text-gray-300"
              />
              <button
                onClick={handleGenerateSequence}
                disabled={seqLoading || !sequenceTopic.trim()}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                {seqLoading ? (
                  <><Loader2 size={12} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={12} /> Generate Sequence</>
                )}
              </button>
              {seqError && (
                <p className="text-[10px] text-red-500 px-1">{seqError}</p>
              )}

              {/* AI-generated steps */}
              {sequence.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sequence.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5 pt-1">
                      {sequence.map((step, i) => (
                        <SortableStep
                          key={step.id}
                          step={step}
                          index={i}
                          onDelete={(id) => setSequence(sequence.filter((s) => s.id !== id))}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Manual step add */}
              <div className="flex gap-2 pt-1 border-t border-gray-200">
                <input
                  value={sequenceStep}
                  onChange={(e) => setSequenceStep(e.target.value)}
                  placeholder="Add manual step..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs outline-none focus:border-blue-500 placeholder:text-gray-300"
                />
                <button
                  onClick={() => {
                    if (sequenceStep.trim()) {
                      setSequence([...sequence, { id: crypto.randomUUID(), title: `Step ${sequence.length + 1}`, body: sequenceStep.trim() }]);
                      setSequenceStep("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === "send-test" && (
          <motion.div
            key="send-test"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Send Test Email</p>
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                type="email"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-xs outline-none focus:border-emerald-500 placeholder:text-gray-300"
              />
              <button className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-all">
                <Send size={12} className="inline mr-1" /> Send Test
              </button>
            </div>
          </motion.div>
        )}

        {activeTool === "export" && (
          <motion.div
            key="export"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Export Options</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Campaign Data", format: "JSON" },
                  { label: "Analytics", format: "CSV" },
                  { label: "Email Content", format: "HTML" },
                  { label: "Full Report", format: "PDF" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-left hover:border-amber-300 transition-all"
                  >
                    <p className="text-[10px] font-bold text-gray-700">{opt.label}</p>
                    <p className="text-[8px] text-gray-400">{opt.format}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
