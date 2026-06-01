import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// Zod validation schemas for all API route inputs.
// Use these to validate request bodies BEFORE processing.
// Usage:
//   const parsed = swarmLaunchSchema.safeParse(body);
//   if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
// ═══════════════════════════════════════════════════════════════════════════

// ── Swarm Launch ──────────────────────────────────────────────────────────
export const swarmLaunchSchema = z.object({
  campaignId: z.string().min(1, "campaignId is required").max(100),
});

// ── Aurelius Chat ─────────────────────────────────────────────────────────
export const aureliusChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10_000),
      })
    )
    .min(1)
    .max(50),
  context: z
    .object({
      pathname: z.string().max(200).optional(),
      swarmStatus: z.string().max(50).optional(),
      confidenceScore: z.number().min(0).max(100).optional(),
      activeAgent: z.string().max(50).nullable().optional(),
      brand: z.any().optional(),
    })
    .optional(),
});

// ── Email Send Test ───────────────────────────────────────────────────────
export const emailSendTestSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(100_000),
});

// ── A/B Test ──────────────────────────────────────────────────────────────
export const abTestSchema = z.object({
  topic: z.string().min(1).max(500),
  count: z.number().int().min(1).max(10).optional().default(5),
  context: z.string().max(5_000).optional(),
  model: z.string().max(50).optional(),
});

// ── Sequence Builder ──────────────────────────────────────────────────────
export const sequenceBuilderSchema = z.object({
  topic: z.string().max(500).optional(),
  context: z.string().max(5_000).optional(),
  steps: z.number().int().min(1).max(8).optional().default(4),
  model: z.string().max(50).optional(),
});

// ── Vault Upload ──────────────────────────────────────────────────────────
export const vaultUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(127),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  projectId: z.string().uuid().optional(),
});

// ── RAG Ingest ────────────────────────────────────────────────────────────
export const ragIngestSchema = z.object({
  campaignId: z.string().max(100).nullable().optional(),
});

// ── Waitlist Join ─────────────────────────────────────────────────────────
export const waitlistJoinSchema = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional(),
  referralSource: z.string().max(200).optional(),
});

// ── Feedback ──────────────────────────────────────────────────────────────
export const feedbackSchema = z.object({
  feedback: z.string().min(1).max(2_000),
  pathname: z.string().max(500).optional(),
});

// ── LinkedIn Enrich ───────────────────────────────────────────────────────
export const linkedinEnrichSchema = z.object({
  url: z.string().url().max(500),
});

// ── GDPR Account Delete ───────────────────────────────────────────────────
export const accountDeleteConfirmSchema = z.object({
  confirm: z.literal(true, { message: "Must confirm with { confirm: true }" }),
});

// ── Helper: validate and return parsed data or NextResponse error ─────────
import { NextResponse } from "next/server";

/**
 * Validates a parsed JSON body against a Zod schema.
 * Returns the parsed data on success, or a 400 NextResponse on failure.
 *
 * Usage:
 *   const parsed = validateBody(schema, body);
 *   if (parsed instanceof NextResponse) return parsed;
 *   // parsed is now typed and safe to use
 */
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown,
): z.infer<T> | NextResponse {
  const result = schema.safeParse(body);
  if (!result.success) {
    const flat = result.error.flatten();
    return NextResponse.json(
      {
        error: "Validation failed",
        details: flat.fieldErrors,
        formErrors: flat.formErrors,
      },
      { status: 400 },
    );
  }
  return result.data;
}
