"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Check, Loader2,
  Database, ArrowRight, ChevronLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useTranslation } from "@/components/I18nProvider";

type Step = "upload" | "processing" | "confirm";

interface ProcessedDoc {
  fileName: string;
  documentId: string;
  totalChunks: number;
  fileType: string;
}

interface RagOnboardingProps {
  onComplete?: (docs: ProcessedDoc[]) => void;
  onSkip?: () => void;
}

export function RagOnboarding({ onComplete, onSkip }: RagOnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [processedDocs, setProcessedDocs] = useState<ProcessedDoc[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/csv": [".csv"],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) {
      if (onSkip) onSkip();
      return;
    }

    setStep("processing");
    setProcessing(true);
    setTotalCount(files.length);
    setProcessedCount(0);

    const results: ProcessedDoc[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/rag/ingest", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          results.push({
            fileName: file.name,
            documentId: data.documentId,
            totalChunks: data.totalChunks,
            fileType: file.type,
          });
        } else {
          toast.error(t("rag.process_error", { name: file.name }));
        }
      } catch {
        toast.error(t("rag.process_error", { name: file.name }));
      }
      setProcessedCount((prev) => prev + 1);
    }

    setProcessedDocs(results);
    setProcessing(false);
    setStep("confirm");
  };

  const progress = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const doneMessage = processedDocs.length === 1
    ? t("rag.done_singular", { count: String(processedDocs.length) })
    : t("rag.done_plural", { count: String(processedDocs.length) });

  const totalChunks = processedDocs.reduce((sum, d) => sum + d.totalChunks, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ──────── STEP 1: UPLOAD ──────── */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Drag & Drop zone */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                ${isDragActive
                  ? "border-copper bg-copper/5 scale-[1.01]"
                  : "border-border hover:border-copper/30 bg-muted/50"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-copper/10 text-copper">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    {isDragActive ? t("rag.upload_drop") : t("rag.upload_title")}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t("rag.upload_hint")}
                  </p>
                </div>
              </div>
            </div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {t("rag.selected_files")} ({files.length})
                  </p>
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-copper shrink-0" />
                        <span className="text-sm text-foreground truncate">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSkip?.()}
                className="text-muted-foreground text-xs"
              >
                {t("rag.skip")}
                <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button
                type="button"
                onClick={processFiles}
                disabled={files.length === 0}
                className="bg-copper hover:opacity-90 text-white h-11 px-8"
              >
                <Database size={16} className="mr-2" />
                {t("rag.process_button")}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ──────── STEP 2: PROCESSING ──────── */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12 space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-copper/10 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-copper" />
            </div>
            <div>
              <p className="text-lg font-display text-foreground">{t("rag.processing_title")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("rag.processing_desc")}
              </p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-2">
                {t("rag.progress", { processed: String(processedCount), total: String(totalCount) })}
              </p>
            </div>
          </motion.div>
        )}

        {/* ──────── STEP 3: CONFIRM ──────── */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Success bubble */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                <Check size={18} className="text-white" />
              </div>
              <div className="bg-card rounded-2xl rounded-tl-none p-4 border border-border shadow-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {processedDocs.length > 0
                    ? doneMessage
                    : t("rag.none_processed")}
                </p>
              </div>
            </div>

            {/* Processed docs summary */}
            {processedDocs.length > 0 && (
              <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {t("rag.ingested_title")}
                </p>
                {processedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-copper shrink-0" />
                      <span className="text-foreground truncate">{doc.fileName}</span>
                    </div>
                    <span className="text-muted-foreground text-xs shrink-0 ml-2">
                      {t("rag.chunks", { count: String(doc.totalChunks) })}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <Database size={12} className="text-copper" />
                  <span className="text-[10px] text-muted-foreground">
                    {t("rag.total_chunks", { count: String(totalChunks) })}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setStep("upload"); setProcessedDocs([]); }}
                className="text-muted-foreground"
              >
                <ChevronLeft size={16} className="mr-1" /> {t("rag.upload_more")}
              </Button>
              <Button
                type="button"
                onClick={() => onComplete?.(processedDocs)}
                className="bg-copper hover:opacity-90 text-white h-11 px-8"
              >
                {t("rag.continue")}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
