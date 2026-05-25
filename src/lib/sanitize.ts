// ═══════════════════════════════════════════════════════════════════════════
// Prompt injection sanitization
//
// Prevents malicious input from manipulating AI model behavior through
// techniques like:
//   - "Ignore all previous instructions..."
//   - "You are now DAN..."
//   - "Act as a different persona..."
//   - HTML/script injection in email bodies
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common prompt manipulation patterns to detect and strip.
 * These are patterns that attempt to alter AI model behavior.
 * We strip them silently rather than hard-rejecting, since legitimate
 * marketing prompts may contain words like "ignore" in normal contexts.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|messages?)\b/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|messages?)\b/gi,
  /you\s+are\s+now\s+(DAN|an?\s+unrestricted|a\s+different)\b/gi,
  /act\s+as\s+(if\s+you\s+are|a\s+different|an?\s+unfiltered)\b/gi,
  /pretend\s+(you\s+are|to\s+be)\b/gi,
  /forget\s+(everything|all|your)\b/gi,
  /override\s+(your\s+)?(instructions?|prompts?|rules?)\b/gi,
  /system\s*(prompt|message|instruction)s?\s*[:=]/gi,
  /new\s+system\s+(prompt|message|instruction)/gi,
  /<\|.*\|>/g, // Special tokens (e.g., <|system|>, <|user|>)
] as const;

/** HTML/script patterns to strip from email content. */
const DANGEROUS_HTML_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onload, onerror, etc.
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
] as const;

/**
 * Strip dangerous HTML/script content from a string.
 * Used for email bodies and other HTML content before sending to AI models.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  let sanitized = input;
  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized;
}

/**
 * Sanitize user messages before sending to AI models.
 *
 * Strategy:
 *   1. HTML/script injection → hard reject (security risk)
 *   2. Prompt manipulation patterns → strip silently and log warning
 *      (legitimate prompts may contain words like "ignore" or "act as")
 *   3. Length → truncate if needed
 *
 * Returns { clean: true, sanitized: string } or { clean: false, reason: string }
 */
export function sanitizeAiInput(
  input: string,
): { clean: true; sanitized: string } | { clean: false; reason: string } {
  if (typeof input !== "string") {
    return { clean: false, reason: "Input must be a string" };
  }

  // 1. HTML/script injection → hard reject only for truly dangerous patterns
  let sanitized = input;
  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    if (pattern.test(input)) {
      return {
        clean: false,
        reason: `Dangerous content detected: script or event handler injection`,
      };
    }
  }

  // 2. Prompt manipulation patterns → strip silently (don't hard-reject)
  //    Words like "ignore" or "act as" are common in legitimate marketing prompts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn(
        `[Sanitize] Stripped potential prompt manipulation pattern from input (${input.slice(0, 80)}…)`,
      );
      sanitized = sanitized.replace(pattern, "[filtered]");
    }
  }

  return { clean: true, sanitized };
}

/**
 * Sanitize all messages in a chat array for Aurelius.
 * Returns sanitized messages or an error if any message contains injection.
 */
export function sanitizeChatMessages(
  messages: Array<{ role: string; content: string }>,
): { clean: true; messages: Array<{ role: string; content: string }> } | { clean: false; reason: string; index: number } {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg) continue;
    const result = sanitizeAiInput(msg.content);
    if (!result.clean) {
      return { clean: false, reason: result.reason, index: i };
    }
    messages[i] = { ...msg, content: result.sanitized };
  }
  return { clean: true, messages };
}

/**
 * Maximum allowed input length for AI prompts (prevents token stuffing attacks).
 */
export const MAX_AI_INPUT_LENGTH = 20_000;

/**
 * Truncate and sanitize input to prevent token stuffing attacks.
 */
export function sanitizeAndTruncate(input: string, maxLength = MAX_AI_INPUT_LENGTH): string {
  const truncated = input.slice(0, maxLength);
  return sanitizeHtml(truncated);
}
