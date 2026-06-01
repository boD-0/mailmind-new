"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Loader2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plan, checkFeatureAccess } from "@/lib/auth/plans";
import Link from "next/link";

interface UploadZoneProps {
  projectId?: string;
  onUploadComplete?: (fileUrl: string) => void;
  userPlan: Plan;
}

export function UploadZone({ projectId, onUploadComplete, userPlan }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const hasAccess = checkFeatureAccess(userPlan, "hasVault");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!hasAccess) {
      toast.error("Upgrade Required: Email Vault este o funcție premium.");
      return;
    }
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      // 1. Obține URL-ul semnat de la API-ul nostru
      const res = await fetch("/api/vault/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          projectId: projectId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Eroare la inițierea upload-ului.");
      }

      const { presignedUrl, fileUrl } = await res.json();
      setProgress(30);

      // 2. Upload direct în Cloudflare R2 folosind URL-ul semnat
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Eroare la încărcarea fișierului în storage.");
      }

      setProgress(100);
      toast.success(`Fișierul ${file.name} a fost încărcat în Vault!`);
      
      if (onUploadComplete) {
        onUploadComplete(fileUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "A apărut o eroare la upload.";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [projectId, onUploadComplete, hasAccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragActive 
            ? "border-copper bg-copper/5 scale-[1.01]" 
            : "border-gray-300 hover:border-copper/50 bg-muted"
          }
          ${uploading || !hasAccess ? "pointer-events-none" : ""}
          ${!hasAccess ? "opacity-40 grayscale" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-copper/10 text-copper">
            {!hasAccess ? (
              <Lock className="w-6 h-6" />
            ) : uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">
              {!hasAccess ? "Vault is Locked" : isDragActive ? "Lasă fișierul aici" : "Încarcă documente în Vault"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {!hasAccess 
                ? "Upgrade to Starter to use Email Vault" 
                : "Drag & drop sau click pentru a selecta (PDF, DOCX, TXT)"}
            </p>
            {!hasAccess && (
              <Link 
                href="/pricing" 
                className="inline-block mt-4 px-4 py-1.5 rounded-full bg-copper text-white text-[10px] font-bold uppercase tracking-widest pointer-events-auto hover:bg-copper/80 transition-colors"
              >
                Upgrade Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Se încarcă...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-gray-200" />
        </div>
      )}
    </div>
  );
}
