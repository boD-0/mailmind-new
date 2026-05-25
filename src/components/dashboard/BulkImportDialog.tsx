"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Table2,
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useTranslation } from "@/components/I18nProvider";
import { usePostHog } from "posthog-js/react";

interface ParsedRow {
  name: string;
  company: string;
  email?: string;
  goal?: string;
  tone?: string;
  url?: string;
}

interface ImportResult {
  success: boolean;
  summary: {
    total: number;
    created: number;
    errors: number;
  };
  campaigns: { id: string; name: string; company: string }[];
  errors?: { row: number; message: string }[];
}

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Helper: generate sample CSV
// ═══════════════════════════════════════════════════════════
function generateSampleCsv(): string {
  return [
    "name,company,email,goal,tone",
    "J. Chen,Arcadia Finance,j.chen@arcadia.com,Book a 20-min discovery call,Direct, data-first",
    "Sarah Kim,Helix Bio,s.kim@helixbio.com,Arrange product demo,Warm, consultative",
    "Mike Rivera,NovaStack,m.rivera@novastack.io,Invite to beta program,Bold, contrarian",
  ].join("\n");
}

function downloadSampleCsv() {
  const blob = new Blob([generateSampleCsv()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mailmind_sample_import.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export function BulkImportDialog({
  open,
  onClose,
  onImportComplete,
}: BulkImportDialogProps) {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">(
    "upload",
  );
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parsedErrors, setParsedErrors] = useState<
    { row: number; message: string }[]
  >([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // ── Reset on close ────────────────────────────────────
  const handleClose = useCallback(() => {
    if (step === "importing") return;
    setStep("upload");
    setParsedRows([]);
    setParsedErrors([]);
    setImportResult(null);
    setProgress(0);
    setProgressMessage("");
    onClose();
  }, [step, onClose]);

  // ── Parse CSV file ─────────────────────────────────────
  const parseCsvFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h: string) => h.trim().toLowerCase(),
        });

        if (result.errors.length > 0 && result.data.length === 0) {
          toast.error(t("dashboard.bulk_import_toast_parse_error"));
          return;
        }

        if (result.data.length === 0) {
          toast.error(t("dashboard.bulk_import_toast_empty"));
          return;
        }

        if (result.data.length > 100) {
          toast.error(t("dashboard.bulk_import_toast_too_many"));
          return;
        }

        const headers = result.meta.fields || [];
        const hasName = headers.some((h) => h.toLowerCase() === "name");
        const hasCompany = headers.some((h) => h.toLowerCase() === "company");

        if (!hasName || !hasCompany) {
          toast.error(t("dashboard.bulk_import_toast_missing_columns"));
          return;
        }

        const mapped: ParsedRow[] = result.data.map(
          (row: Record<string, string>) => ({
            name: row["name"]?.trim() || "",
            company: row["company"]?.trim() || "",
            email: row["email"]?.trim() || undefined,
            goal: row["goal"]?.trim() || undefined,
            tone: row["tone"]?.trim() || undefined,
            url: row["url"]?.trim() || row["linkedin"]?.trim() || undefined,
          }),
        );

        const invalid: { row: number; message: string }[] = [];
        mapped.forEach((r, i) => {
          if (!r.name || !r.company) {
            invalid.push({
              row: i + 2,
              message: "Missing name or company",
            });
          }
        });

        setParsedRows(mapped.filter((r) => r.name && r.company));
        setParsedErrors(invalid);
        setStep("preview");
      };
      reader.readAsText(file);
    },
    [t],
  );

  // ── Dropzone ───────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (
        !file.name.toLowerCase().endsWith(".csv") &&
        file.type !== "text/csv"
      ) {
        toast.error(t("dashboard.bulk_import_toast_wrong_type"));
        return;
      }
      parseCsvFile(file);
    },
    [parseCsvFile, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  // ── Execute import ─────────────────────────────────────
  const executeImport = useCallback(async () => {
    if (parsedRows.length === 0) return;

    setStep("importing");
    setProgress(0);
    setProgressMessage(
      t("dashboard.bulk_import_importing_preparing", {
        count: parsedRows.length,
      }),
    );

    // Build CSV from parsed rows to send
    const csvContent = Papa.unparse(
      parsedRows.map((r) => ({
        name: r.name,
        company: r.company,
        email: r.email || "",
        goal: r.goal || "",
        tone: r.tone || "",
        url: r.url || "",
      })),
    );

    const file = new File([csvContent], "import.csv", { type: "text/csv" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(20);
      setProgressMessage(t("dashboard.bulk_import_importing_uploading"));

      const res = await fetch("/api/prospects/import", {
        method: "POST",
        body: formData,
      });

      setProgress(60);
      setProgressMessage(t("dashboard.bulk_import_importing_creating"));

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed.");
      }

      setProgress(100);
      setProgressMessage(t("dashboard.bulk_import_importing_done"));

      setImportResult(data as ImportResult);
      setStep("done");

      posthog.capture("bulk_import", {
        total_rows: parsedRows.length,
        created: data.summary.created,
        errors: data.summary.errors,
      });

      if (onImportComplete) {
        setTimeout(() => onImportComplete(), 1500);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      setStep("preview");
    }
  }, [parsedRows, onImportComplete, t, posthog]);

  // ── Row preview (limited to first 8) ───────────────────
  const previewRows = parsedRows.slice(0, 8);

  // ── Column display logic ───────────────────────────────
  const visibleColumns: (keyof ParsedRow)[] = ["name", "company"];
  if (parsedRows.some((r) => r.email)) visibleColumns.push("email");
  if (parsedRows.some((r) => r.goal)) visibleColumns.push("goal");
  if (parsedRows.some((r) => r.tone)) visibleColumns.push("tone");

  const columnLabels: Record<keyof ParsedRow, string> = {
    name: "Name",
    company: "Company",
    email: "Email",
    goal: "Goal",
    tone: "Tone",
    url: "URL",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step !== "importing" ? handleClose : undefined}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
                  <Table2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-foreground">
                    {t("dashboard.bulk_import_title")}
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {t("dashboard.bulk_import_subtitle")}
                  </p>
                </div>
              </div>
              {step !== "importing" && (
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* ── UPLOAD STEP ─────────────────────────── */}
              {step === "upload" && (
                <div className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                      ${
                        isDragActive
                          ? "border-emerald-400 bg-emerald-50 scale-[1.01]"
                          : "border-gray-300 hover:border-emerald-300 bg-muted/50"
                      }
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                        <Upload size={24} />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {isDragActive
                            ? t("dashboard.bulk_import_drop_active")
                            : t("dashboard.bulk_import_drop")}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {t("dashboard.bulk_import_drop_hint")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={downloadSampleCsv}
                      className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={14} />
                      {t("dashboard.bulk_import_sample")}
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      {t("dashboard.bulk_import_max_rows")}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t("dashboard.bulk_import_columns_title")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "name*",
                        "company*",
                        "email",
                        "goal",
                        "tone",
                        "url",
                      ].map((col) => (
                        <span
                          key={col}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            col.includes("*")
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      * Required columns. All others are optional.
                    </p>
                  </div>
                </div>
              )}

              {/* ── PREVIEW STEP ────────────────────────── */}
              {step === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("dashboard.bulk_import_preview_title", {
                          count: parsedRows.length,
                        })}
                      </p>
                      {parsedErrors.length > 0 && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          {t("dashboard.bulk_import_skipped", {
                            count: parsedErrors.length,
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep("upload")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("dashboard.bulk_import_choose_other")}
                    </button>
                  </div>

                  {/* Preview table */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              #
                            </th>
                            {visibleColumns.map((col) => (
                              <th
                                key={col}
                                className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                              >
                                {columnLabels[col]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-3 py-2 text-[11px] text-muted-foreground font-mono">
                                {i + 1}
                              </td>
                              {visibleColumns.map((col) => (
                                <td
                                  key={col}
                                  className="px-3 py-2 text-[13px] text-foreground"
                                >
                                  {row[col] || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 8 && (
                      <div className="px-3 py-2 text-[11px] text-muted-foreground bg-muted/30 border-t border-border text-center">
                        {t("dashboard.bulk_import_and_more_rows", {
                          count: parsedRows.length - 8,
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={executeImport}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={15} />
                    {t("dashboard.bulk_import_import_button", {
                      count: parsedRows.length,
                    })}
                  </button>
                </div>
              )}

              {/* ── IMPORTING STEP ──────────────────────── */}
              {step === "importing" && (
                <div className="py-12 flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 size={40} className="text-emerald-600" />
                  </motion.div>
                  <div className="text-center space-y-1">
                    <p className="text-foreground font-medium">
                      {progressMessage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.bulk_import_importing_warning")}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* ── DONE STEP ───────────────────────────── */}
              {step === "done" && importResult && (
                <div className="py-6 space-y-5">
                  {/* Success header */}
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="w-14 h-14 rounded-full bg-emerald-100 grid place-items-center"
                    >
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">
                        {t("dashboard.bulk_import_done_title")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("dashboard.bulk_import_done_subtitle", {
                          created: importResult.summary.created,
                          total: importResult.summary.total,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-border">
                      <p className="text-2xl font-bold text-foreground">
                        {importResult.summary.total}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {t("dashboard.bulk_import_stat_total")}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                      <p className="text-2xl font-bold text-emerald-700">
                        {importResult.summary.created}
                      </p>
                      <p className="text-[10px] text-emerald-600 uppercase tracking-wider">
                        {t("dashboard.bulk_import_stat_created")}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-3 text-center border ${
                        importResult.summary.errors > 0
                          ? "bg-amber-50 border-amber-200"
                          : "bg-gray-50 border-border"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          importResult.summary.errors > 0
                            ? "text-amber-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {importResult.summary.errors}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {t("dashboard.bulk_import_stat_errors")}
                      </p>
                    </div>
                  </div>

                  {/* Error details */}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-amber-600" />
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                          {t("dashboard.bulk_import_errors_title")}
                        </p>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 5).map((e, i) => (
                          <p
                            key={i}
                            className="text-[11px] text-amber-700 font-mono"
                          >
                            Row {e.row}: {e.message}
                          </p>
                        ))}
                        {importResult.errors.length > 5 && (
                          <p className="text-[11px] text-amber-600">
                            {t("dashboard.bulk_import_and_more_errors", {
                              count: importResult.errors.length - 5,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Campaign list preview */}
                  {importResult.campaigns.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("dashboard.bulk_import_created_campaigns")}
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {importResult.campaigns.slice(0, 5).map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-border text-sm"
                          >
                            <CheckCircle2
                              size={12}
                              className="text-emerald-500 shrink-0"
                            />
                            <span className="text-foreground font-medium">
                              {c.name}
                            </span>
                            <span className="text-muted-foreground">@</span>
                            <span className="text-muted-foreground">
                              {c.company}
                            </span>
                          </div>
                        ))}
                        {importResult.campaigns.length > 5 && (
                          <p className="text-[11px] text-muted-foreground pl-6">
                            {t("dashboard.bulk_import_and_more_campaigns", {
                              count: importResult.campaigns.length - 5,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-lg bg-copper text-white font-medium text-sm hover:bg-copper/80 transition-colors"
                  >
                    {t("dashboard.bulk_import_done_button")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
