"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, File, Download, Trash2, Eye, Loader2,
  Database, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { EmptyState } from "@/components/ui/empty-state";

type VaultDocument = {
  id: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  projectId: string | null;
  createdAt: string;
};

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File size={18} />;
  if (mimeType.startsWith("image/")) return <ImageIcon size={18} className="text-blue-500" />;
  if (mimeType.includes("pdf")) return <FileText size={18} className="text-copper" />;
  if (mimeType.includes("word") || mimeType.includes("doc")) return <FileText size={18} className="text-blue-600" />;
  return <File size={18} />;
}

function isPreviewable(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType.includes("pdf") || mimeType.startsWith("text/");
}

export function VaultBrowser() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/list");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      toast.error("Failed to load vault documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDocuments();
  }, [loadDocuments]);

  const handleDownload = async (doc: VaultDocument) => {
    try {
      const res = await fetch("/api/vault/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: doc.fileKey }),
      });
      if (!res.ok) throw new Error("Failed to get download URL");
      const { signedUrl } = await res.json();
      window.open(signedUrl, "_blank");
    } catch {
      toast.error("Failed to generate download link");
    }
  };

  const handlePreview = (doc: VaultDocument) => {
    setPreviewDoc(doc);
    setPreviewUrl(doc.fileUrl);
  };

  const handleDelete = async (doc: VaultDocument) => {
    setDeletingId(doc.id);
    try {
      const res = await fetch("/api/vault/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success(`${doc.fileName} deleted`);
      if (previewDoc?.id === doc.id) {
        setPreviewDoc(null);
        setPreviewUrl(null);
      }
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Empty state */}
      {documents.length === 0 && (
        <EmptyState
          icon={<Database size={48} />}
          message="Your Vault is empty. Upload brand guidelines, case studies, or reference docs — the swarm uses them as context for every campaign."
          ctaLabel="Upload Document"
          className="py-16"
        />
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode={prefersReducedMotion ? "sync" : "popLayout"}>
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.95 }}
                transition={prefersReducedMotion ? { duration: 0 } : {
                  duration: 0.3,
                  delay: i * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                layout={!prefersReducedMotion}
                className={cn(
                  "group relative rounded-xl border border-border bg-card p-4 hover:border-copper/20 hover:shadow-sm transition-all",
                  previewDoc?.id === doc.id && "ring-1 ring-copper/30",
                )}
              >
                {/* Icon + Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatFileSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.mimeType && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono uppercase">
                        {doc.mimeType}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPreviewable(doc.mimeType) && (
                    <button
                      onClick={() => handlePreview(doc)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-copper hover:bg-copper/5 transition-colors"
                    >
                      <Eye size={13} /> Preview
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-copper hover:bg-copper/5 transition-colors"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && previewDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-50 mx-auto my-8 max-w-4xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(previewDoc.mimeType)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{previewDoc.fileName}</p>
                    <p className="text-[11px] text-muted-foreground">{formatFileSize(previewDoc.fileSize)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-copper transition-colors"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => window.open(previewUrl, "_blank")}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-copper transition-colors"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-4">
                {previewDoc.mimeType?.startsWith("image/") ? (
                  <Image
                    src={previewUrl}
                    alt={previewDoc.fileName}
                    width={800}
                    height={600}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : previewDoc.mimeType?.includes("pdf") ? (
                  <iframe
                    src={previewUrl}
                    title={previewDoc.fileName}
                    className="w-full h-full min-h-[60vh] rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground text-sm">
                      Preview not available for this file type.{" "}
                      <button
                        onClick={() => window.open(previewUrl, "_blank")}
                        className="text-copper hover:underline"
                      >
                        Open in new tab
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
