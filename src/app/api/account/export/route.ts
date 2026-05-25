import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  users,
  projects,
  vaultDocuments,
  swarmExecutions,
  emailEvents,
  prospects,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp } from "@/lib/get-client-ip";
import { randomUUID } from "crypto";

/**
 * GET /api/account/export
 *
 * GDPR data portability endpoint. Returns a JSON bundle of ALL user data.
 *
 * Exported data includes:
 *   - Profile (name, email, plan, trial info, swarm credits)
 *   - Projects (brand profiles)
 *   - Vault documents (file metadata, not actual files)
 *   - Swarm executions
 *   - Email events (open/click tracking)
 *   - Prospects (OCEAN profiles)
 *   - Account metadata (created, updated)
 *
 * The response is a JSON object with timestamps for each section.
 * For production, consider streaming as a ZIP file via archiver package.
 */
export async function GET(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  const userId = user.id;
  const ip = getClientIp(request);
  const exportId = randomUUID();
  const exportedAt = new Date().toISOString();

  try {
    // ── Fetch all user data in parallel ──────────────────────────────────
    const [
      userRow,
      projectRows,
      vaultRows,
      swarmRows,
      emailRows,
      prospectRows,
    ] = await Promise.all([
      db
        .select({
          name: users.name,
          email: users.email,
          plan: users.plan,
          emailVerified: users.emailVerified,
          onboardingComplete: users.onboardingComplete,
          trialEnd: users.trialEnd,
          swarmCredits: users.swarmCredits,
          polarSubscriptionId: users.polarSubscriptionId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),

      db
        .select({
          name: projects.name,
          industry: projects.industry,
          toneOfVoice: projects.toneOfVoice,
          targetAudience: projects.targetAudience,
          context: projects.context,
          brandValues: projects.brandValues,
          painPoints: projects.painPoints,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .where(eq(projects.userId, userId)),

      db
        .select({
          fileName: vaultDocuments.fileName,
          fileSize: vaultDocuments.fileSize,
          mimeType: vaultDocuments.mimeType,
          createdAt: vaultDocuments.createdAt,
        })
        .from(vaultDocuments)
        .where(eq(vaultDocuments.userId, userId)),

      db
        .select({
          agentsUsed: swarmExecutions.agentsUsed,
          inputPrompt: swarmExecutions.inputPrompt,
          modelUsed: swarmExecutions.modelUsed,
          tokensUsed: swarmExecutions.tokensUsed,
          durationMs: swarmExecutions.durationMs,
          status: swarmExecutions.status,
          createdAt: swarmExecutions.createdAt,
        })
        .from(swarmExecutions)
        .where(eq(swarmExecutions.userId, userId)),

      db
        .select({
          eventType: emailEvents.eventType,
          recipientEmail: emailEvents.recipientEmail,
          metadata: emailEvents.metadata,
          createdAt: emailEvents.createdAt,
        })
        .from(emailEvents)
        .where(eq(emailEvents.userId, userId)),

      db
        .select({
          name: prospects.name,
          email: prospects.email,
          company: prospects.company,
          title: prospects.title,
          oceanoScores: prospects.oceanoScores,
          tags: prospects.tags,
          notes: prospects.notes,
          lastContactedAt: prospects.lastContactedAt,
          createdAt: prospects.createdAt,
        })
        .from(prospects)
        .where(eq(prospects.userId, userId)),
    ]);

    // Log the export event
    await logAuditEvent({
      userId,
      action: "account.data_exported",
      metadata: {
        exportId,
        sections: {
          profile: !!userRow[0],
          projects: projectRows.length,
          vault: vaultRows.length,
          swarms: swarmRows.length,
          emails: emailRows.length,
          prospects: prospectRows.length,
        },
      },
      ipAddress: ip,
    });

    const dataExport = {
      export_id: exportId,
      exported_at: exportedAt,
      account: userRow[0] || null,
      projects: projectRows,
      vault_documents: vaultRows,
      swarm_executions: swarmRows,
      email_events: emailRows,
      prospects: prospectRows,
    };

    console.log(
      `[GDPR] Data export generated for user ${userId.slice(0, 8)}… — exportId: ${exportId}`,
    );

    return NextResponse.json(dataExport, {
      headers: {
        "Content-Disposition": `attachment; filename="mailmind-export-${exportedAt.slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GDPR] Data export failed:", error);
    return NextResponse.json(
      { error: "Failed to export data. Please contact support." },
      { status: 500 },
    );
  }
}
