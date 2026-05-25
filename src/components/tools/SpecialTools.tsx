"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FlaskConical, Layers, Send, Download, X, Loader2, Sparkles, Copy,
  Wrench, GripVertical, CheckCircle2, Circle,
  FileJson, Clock, BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ToolCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export type { ToolCard };

interface AbVariant {
  text: string;
  sandboxScore?: number;
  sandboxFeedback?: string;
  sandboxLoading?: boolean;
}

interface SequenceStep {
  id: string;
  title: string;
  body: string;
  day: number;
  status: "draft" | "ready" | "sent";
  subject: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

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

function SortableStep({ step, index, onDelete, onDayChange, onStatusToggle }: {
  step: SequenceStep;
  index: number;
  onDelete: (id: string) => void;
  onDayChange: (id: string, day: number) => void;
  onStatusToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusIcon = step.status === "sent"
    ? <CheckCircle2 size={12} className="text-emerald-500" />
    : step.status === "ready"
      ? <CheckCircle2 size={12} className="text-amber-500" />
      : <Circle size={12} className="text-muted-foreground/50" />;

  const statusColor = step.status === "sent"
    ? "bg-emerald-100 text-emerald-600"
    : step.status === "ready"
      ? "bg-amber-100 text-amber-600"
      : "bg-muted text-muted-foreground";

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 px-2.5 py-2 bg-white rounded-lg border border-border">
      <button {...attributes} {...listeners} className="shrink-0 mt-1 p-0.5 cursor-grab active:cursor-grabbing hover:bg-muted rounded transition-colors">
        <GripVertical size={12} className="text-muted-foreground/50" />
      </button>

      {/* Day badge */}
      <div className="shrink-0 flex flex-col items-center gap-0.5">
        <span className="w-8 h-6 rounded bg-blue-50 border border-blue-100 flex items-center justify-center">
          <input
            type="number"
            min={1}
            value={step.day}
            onChange={(e) => onDayChange(step.id, Math.max(1, parseInt(e.target.value) || 1))}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent text-center text-[10px] font-bold text-blue-600 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={`Day ${step.day}`}
          />
        </span>
        <span className="text-[7px] text-muted-foreground font-bold uppercase">Day</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold text-foreground/80 truncate">{step.title}</p>
          <button onClick={() => onStatusToggle(step.id)} className="shrink-0" title={`Status: ${step.status}`}>
            {statusIcon}
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{step.body}</p>
        <p className="text-[8px] text-muted-foreground/60 mt-1 truncate">
          <span className="font-mono">Subject:</span> {step.subject}
        </p>
      </div>

      <button onClick={() => onDelete(step.id)}>
        <X size={12} className="text-muted-foreground/50 hover:text-red-500" />
      </button>
    </div>
  );
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAsHTML(title: string, content: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
  downloadFile(html, `${title.replace(/\s+/g, "_")}.html`, "text/html");
}

function exportAsText(title: string, content: string) {
  const text = `${title}\n${"=".repeat(title.length)}\n\n${content.replace(/<[^>]+>/g, "")}`;
  downloadFile(text, `${title.replace(/\s+/g, "_")}.txt`, "text/plain");
}

function exportAsPDF(title: string, content: string) {
  // Use browser print API for PDF
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow pop-ups to export as PDF");
    return;
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

// ─── SPECIAL TOOLS ───────────────────────────────────────────────────────────

export function SpecialTools({ emailContent }: { emailContent?: string }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // A/B Test state
  const [abTopic, setAbTopic] = useState("");
  const [abContext, setAbContext] = useState("");
  const [abVariants, setAbVariants] = useState<AbVariant[]>([]);
  const [abLoading, setAbLoading] = useState(false);
  const [abError, setAbError] = useState("");
  const [abCompareMode, setAbCompareMode] = useState(false);

  // Sequence state
  const [sequenceTopic, setSequenceTopic] = useState("");
  const [sequence, setSequence] = useState<SequenceStep[]>([]);
  const [sequenceStepBody, setSequenceStepBody] = useState("");
  const [seqLoading, setSeqLoading] = useState(false);
  const [seqError, setSeqError] = useState("");
  const [seqShowExport, setSeqShowExport] = useState(false);

  // Export state
  const [exportTitle, setExportTitle] = useState("");
  const [exportContent, setExportContent] = useState("");

  // Send Test state
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testContent, setTestContent] = useState(emailContent || "");
  const [testSending, setTestSending] = useState(false);

  // Sync emailContent from parent when it changes (e.g., user edits in EmailEditor)
  useEffect(() => {
    setTestContent(emailContent || "");
  }, [emailContent]);

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
      setAbVariants(data.variants.map((v: string) => ({ text: v })));
      setAbCompareMode(false);
    } catch (err) {
      setAbError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setAbLoading(false);
    }
  };

  // ── A/B Test: Run sandbox on a variant ──
  const handleSandboxVariant = async (index: number) => {
    const variant = abVariants[index];
    if (!variant || variant.sandboxLoading) return;

    setAbVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, sandboxLoading: true } : v))
    );

    try {
      // Simulate sandbox — in production, call actual sandbox API
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

      const score = Math.round(40 + Math.random() * 55);
      const feedbacks = [
        "Strong curiosity trigger — prospect likely to open.",
        "Good personalization, but opening could be more specific.",
        "Clear value proposition, low spam risk.",
        "Tone aligns well with prospect profile.",
      ];

      setAbVariants((prev) =>
        prev.map((v, i) =>
          i === index
            ? { ...v, sandboxLoading: false, sandboxScore: score, sandboxFeedback: feedbacks[Math.floor(Math.random() * feedbacks.length)] }
            : v
        )
      );
    } catch {
      setAbVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, sandboxLoading: false } : v))
      );
      toast.error("Sandbox analysis failed");
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
      setSequence(
        data.sequence.map((s: { title: string; body: string }, idx: number) => ({
          ...s,
          id: crypto.randomUUID(),
          day: (idx + 1) * 2, // Default: every 2 days
          status: "draft" as const,
          subject: s.body.split(".")[0]?.slice(0, 60) + "." || s.title,
        }))
      );
    } catch (err) {
      setSeqError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setSeqLoading(false);
    }
  };

  const handleSequenceExportJSON = () => {
    const json = JSON.stringify(
      sequence.map(({ id, ...rest }) => rest),
      null,
      2
    );
    downloadFile(json, `sequence_${sequenceTopic.replace(/\s+/g, "_") || "export"}.json`, "application/json");
    toast.success("Sequence exported as JSON");
  };

  const handleDayChange = (id: string, day: number) => {
    setSequence((prev) => prev.map((s) => (s.id === id ? { ...s, day } : s)));
  };

  const handleStatusToggle = (id: string) => {
    setSequence((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { draft: "ready", ready: "sent", sent: "draft" } as const;
        return { ...s, status: next[s.status] };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={14} className="text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  ? "bg-copper/5 border-copper/30 shadow-sm"
                  : "bg-white border-border hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <Icon size={18} className={`${tool.color} mb-1.5`} />
              <p className="text-[11px] font-bold text-foreground">{tool.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {/* Tool Panels */}
      <AnimatePresence mode="wait">
        {/* ─── A/B TEST ──────────────────────────────────────────────────────── */}
        {activeTool === "ab-test" && (
          <motion.div
            key="ab-test"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted rounded-xl border border-border space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject Line A/B Test</p>
              <input
                value={abTopic}
                onChange={(e) => setAbTopic(e.target.value)}
                placeholder="e.g. New product launch — AI analytics"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-purple-500 placeholder:text-muted-foreground/50"
              />
              <input
                value={abContext}
                onChange={(e) => setAbContext(e.target.value)}
                placeholder="Optional: target audience, tone, key benefit..."
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-purple-500 placeholder:text-muted-foreground/50"
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

              {/* Variants with sandbox scores */}
              {abVariants.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                      {abVariants.length} variants
                    </span>
                    <button
                      onClick={() => setAbCompareMode(!abCompareMode)}
                      className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider transition-colors ${
                        abCompareMode ? "text-purple-600" : "text-muted-foreground hover:text-purple-500"
                      }`}
                    >
                      <BarChart3 size={10} />
                      {abCompareMode ? "Hide Scores" : "Compare Scores"}
                    </button>
                  </div>

                  {abVariants.map((v, i) => (
                    <div
                      key={i}
                      className="flex flex-col px-2.5 py-2 bg-white rounded-lg border border-border text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-foreground/80">{v.text}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => navigator.clipboard.writeText(v.text)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy size={10} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleSandboxVariant(i)}
                            disabled={v.sandboxLoading}
                            className="p-1 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                            title="Run sandbox analysis"
                          >
                            {v.sandboxLoading ? (
                              <Loader2 size={10} className="animate-spin text-purple-400" />
                            ) : (
                              <FlaskConical size={10} className="text-purple-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Sandbox score */}
                      {abCompareMode && v.sandboxScore !== undefined && (
                        <div className="mt-2 ml-6 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${v.sandboxScore}%` }}
                              className={`h-full rounded-full ${
                                v.sandboxScore >= 75 ? "bg-emerald-500" : v.sandboxScore >= 50 ? "bg-amber-500" : "bg-red-500"
                              }`}
                            />
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${
                            v.sandboxScore >= 75 ? "text-emerald-600" : v.sandboxScore >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {v.sandboxScore}%
                          </span>
                        </div>
                      )}
                      {abCompareMode && v.sandboxFeedback && (
                        <p className="mt-1 ml-6 text-[9px] text-muted-foreground">{v.sandboxFeedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── SEQUENCE BUILDER ─────────────────────────────────────────────── */}
        {activeTool === "sequence" && (
          <motion.div
            key="sequence"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Follow-up Sequence</p>
                {sequence.length > 0 && (
                  <button
                    onClick={() => setSeqShowExport(!seqShowExport)}
                    className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <FileJson size={10} />
                    {seqShowExport ? "Hide Export" : "Export"}
                  </button>
                )}
              </div>

              <input
                value={sequenceTopic}
                onChange={(e) => setSequenceTopic(e.target.value)}
                placeholder="e.g. Cold email for SaaS demo"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-blue-500 placeholder:text-muted-foreground/50"
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

              {/* Export section */}
              <AnimatePresence>
                {seqShowExport && sequence.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-lg border border-border p-2.5 space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Export Options</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleSequenceExportJSON}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
                        >
                          <FileJson size={10} /> JSON
                        </button>
                        <button
                          onClick={() => exportAsHTML(sequenceTopic, sequence.map((s) => `<h3>Day ${s.day}: ${s.title}</h3><p>${s.body}</p>`).join(""))}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1"
                        >
                          <Download size={10} /> HTML
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI-generated steps */}
              {sequence.length > 0 && (
                <>
                  {/* Sequence summary */}
                  <div className="flex items-center gap-3 text-[8px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><Clock size={10} /> {sequence.length} steps</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      {sequence.filter((s) => s.status === "sent").length} sent
                    </span>
                    <span className="flex items-center gap-1">
                      <Circle size={10} />
                      {sequence.filter((s) => s.status === "draft").length} draft
                    </span>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sequence.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1.5 pt-1">
                        {sequence.map((step, i) => (
                          <SortableStep
                            key={step.id}
                            step={step}
                            index={i}
                            onDelete={(id) => setSequence(sequence.filter((s) => s.id !== id))}
                            onDayChange={handleDayChange}
                            onStatusToggle={handleStatusToggle}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}

              {/* Manual step add */}
              <div className="flex gap-2 pt-1 border-t border-border">
                <input
                  value={sequenceStepBody}
                  onChange={(e) => setSequenceStepBody(e.target.value)}
                  placeholder="Add manual step..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-border text-xs outline-none focus:border-blue-500 placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => {
                    if (sequenceStepBody.trim()) {
                      const nextDay = sequence.length > 0 ? Math.max(...sequence.map((s) => s.day)) + 2 : 1;
                      setSequence([
                        ...sequence,
                        {
                          id: crypto.randomUUID(),
                          title: `Step ${sequence.length + 1}`,
                          body: sequenceStepBody.trim(),
                          day: nextDay,
                          status: "draft" as const,
                          subject: sequenceStepBody.trim().split(".")[0]?.slice(0, 60) + "." || "",
                        },
                      ]);
                      setSequenceStepBody("");
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

        {/* ─── SEND TEST ────────────────────────────────────────────────────── */}
        {activeTool === "send-test" && (
          <motion.div
            key="send-test"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted rounded-xl border border-border space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Send Test Email</p>

              {/* Recipient */}
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                type="email"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50"
              />

              {/* Subject line */}
              <input
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50"
              />

              {/* Email body (HTML) */}
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Paste email HTML here (or use the EmailEditor content)..."
                rows={6}
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-emerald-500 placeholder:text-muted-foreground/50 resize-y font-mono leading-relaxed"
              />

              {/* Send button */}
              <button
                onClick={async () => {
                  if (!testEmail.trim() || !testSubject.trim() || !testContent.trim()) {
                    toast.error("Please fill in recipient, subject, and email body.");
                    return;
                  }
                  setTestSending(true);
                  try {
                    const res = await fetch("/api/email/send-test", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: testEmail.trim(),
                        subject: testSubject.trim(),
                        html: testContent.trim(),
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to send");
                    toast.success(`Test email sent to ${testEmail}`);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to send test email");
                  } finally {
                    setTestSending(false);
                  }
                }}
                disabled={testSending || !testEmail.trim() || !testSubject.trim() || !testContent.trim()}
                className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                {testSending ? (
                  <><Loader2 size={12} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={12} /> Send Test</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── EXPORT ───────────────────────────────────────────────────────── */}
        {activeTool === "export" && (
          <motion.div
            key="export"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-muted rounded-xl border border-border space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Export Options</p>

              {/* Title input */}
              <input
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)}
                placeholder="Campaign title (optional)"
                className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-xs outline-none focus:border-amber-500 placeholder:text-muted-foreground/50"
              />

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => exportAsPDF(exportTitle || "Campaign", exportContent || "<p>Email content goes here</p>")}
                  className="px-3 py-2 rounded-lg bg-white border border-border text-left hover:border-amber-300 transition-all flex flex-col items-center gap-1"
                >
                  <Download size={16} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-foreground/80">PDF</p>
                  <p className="text-[8px] text-muted-foreground">Print-ready</p>
                </button>
                <button
                  onClick={() => exportAsHTML(exportTitle || "Campaign", exportContent || "<p>Email content goes here</p>")}
                  className="px-3 py-2 rounded-lg bg-white border border-border text-left hover:border-amber-300 transition-all flex flex-col items-center gap-1"
                >
                  <Download size={16} className="text-orange-500" />
                  <p className="text-[10px] font-bold text-foreground/80">HTML</p>
                  <p className="text-[8px] text-muted-foreground">Web-ready</p>
                </button>
                <button
                  onClick={() => exportAsText(exportTitle || "Campaign", exportContent || "Email content goes here")}
                  className="px-3 py-2 rounded-lg bg-white border border-border text-left hover:border-amber-300 transition-all flex flex-col items-center gap-1"
                >
                  <Download size={16} className="text-gray-500" />
                  <p className="text-[10px] font-bold text-foreground/80">Plain Text</p>
                  <p className="text-[8px] text-muted-foreground">Universal</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { label: "Campaign Data", format: "JSON" },
                  { label: "Analytics", format: "CSV" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    className="px-3 py-2 rounded-lg bg-white border border-border text-left hover:border-amber-300 transition-all"
                  >
                    <p className="text-[10px] font-bold text-foreground/80">{opt.label}</p>
                    <p className="text-[8px] text-muted-foreground">{opt.format}</p>
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
