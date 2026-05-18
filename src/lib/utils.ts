import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe JSON parse utility to prevent "Unexpected token '', \"\" is not valid JSON" errors.
 */
export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str || typeof str !== 'string') return fallback;
  
  try {
    // Remove BOM and trim
    const cleaned = str.replace(/^\uFEFF/, "").trim();
    if (!cleaned) return fallback;

    // Remove any markdown code blocks if present (common in AI responses)
    const finalStr = cleaned.replace(/```json\n?|```/g, '').trim();
    if (!finalStr) return fallback;

    return JSON.parse(finalStr) as T;
  } catch (error) {
    // Only log if it's not an empty-ish string that we already checked
    const trimmed = str.trim();
    if (trimmed.length > 0) {
      console.error("Failed to parse JSON:", str, error);
    }
    return fallback;
  }
}

/**
 * Safe clipboard copy utility.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Fallback for older browsers or non-secure contexts
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
