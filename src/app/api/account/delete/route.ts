import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  users,
  sessions,
  accounts,
  verifications,
  projects,
  vaultDocuments,
  swarmExecutions,
  apiUsage,
  apiUsageDaily,
  emailEvents,
  gmailConnections,
  prospects,
  waitlist,
  auditLog as auditLogTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { auth } from "@/lib/auth/auth";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp } from "@/lib/get-client-ip";

/**
 * POST /api/account/delete
 *
 * Permanently deletes the authenticated user's account and ALL associated data.
 * This is a destructive, irreversible operation required for GDPR compliance.
 *
 * Body: { confirm: true }
 *
 * Cascading deletes (handled by DB foreign keys):
 *   - sessions
 *   - accounts (OAuth)
 *   - projects
 *   - vault_documents
 *   - swarm_executions
 *   - api_usage
 *   - api_usage_daily
 *   - email_events
 *   - gmail_connections
 *   - prospects
 *   - waitlist (if any)
 *   - audit_log
 *
 * The user row itself is deleted last.
 * Better-Auth verifications are also cleaned up.
 */
export async function POST(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();

    // Require explicit confirmation
    if (body?.confirm !== true) {
      return NextResponse.json(
        { error: "Must confirm deletion with { confirm: true }" },
        { status: 400 },
      );
    }

    const userId = user.id;
    const ip = getClientIp(request);

    // Log the deletion request BEFORE executing (for audit trail)
    await logAuditEvent({
      userId,
      action: "account.delete_requested",
      metadata: {
        email: user.email?.replace(/(.{2}).*(@.*)/, "$1***$2"),
        plan: user.plan,
        timestamp: new Date().toISOString(),
      },
      ipAddress: ip,
    });

    // ── Delete all user data in dependency order ────────────────────────
    // Most data cascades via foreign keys, but we explicitly clean up
    // non-cascaded tables and double-check.

    // 1. Revoke sessions directly (Better-Auth doesn't expose a bulk revoke)
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // 2. Delete verifications (Better-Auth — not cascaded from users)
    await db.delete(verifications).where(eq(verifications.identifier, userId));

    // 3. Delete api_usage_daily (not always cascaded properly)
    await db.delete(apiUsageDaily).where(eq(apiUsageDaily.userId, userId));

    // 4. The remaining tables cascade automatically when we delete the user:
    //    accounts, projects, vault_documents, swarm_executions,
    //    api_usage, email_events, gmail_connections, prospects, waitlist,
    //    audit_log

    // 5. Finally, delete the user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found or already deleted" },
        { status: 404 },
      );
    }

    console.log(
      `[GDPR] Account permanently deleted: ${user.email?.replace(/(.{2}).*(@.*)/, "$1***$2")} (${userId.slice(0, 8)}…)`,
    );

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error) {
    console.error("[GDPR] Account deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 },
    );
  }
}
