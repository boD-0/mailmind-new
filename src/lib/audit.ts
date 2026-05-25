import { db } from "@/db/drizzle";
import { auditLog } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// Audit logging utility.
//
// Logs security-relevant actions to the `audit_log` table for compliance
// and incident investigation. Actions logged include:
//   - User login / logout
//   - Swarm launch
//   - Vault upload / document deletion
//   - Settings changes (name, plan, etc.)
//   - Gmail connect / disconnect
//   - GDPR account deletion / data export
//   - Plan upgrade / downgrade
// ═══════════════════════════════════════════════════════════════════════════

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.signup"
  | "auth.failed_login"
  | "swarm.launch"
  | "swarm.cancel"
  | "vault.upload"
  | "vault.delete"
  | "rag.ingest"
  | "settings.name_changed"
  | "settings.brand_updated"
  | "settings.avatar_changed"
  | "gmail.connect"
  | "gmail.disconnect"
  | "plan.upgrade"
  | "plan.downgrade"
  | "plan.trial_expired"
  | "account.delete_requested"
  | "account.deleted"
  | "account.data_exported"
  | "admin.maintenance_toggled"
  | "admin.swarm_params_updated"
  | "email.send_test"
  | "prospect.import"
  | "webhook.polar"
  | "webhook.stripe";

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an audit event to the database.
 * Fire-and-forget — errors are caught and logged but never thrown.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  } catch (error) {
    // Audit log failures should never break the main flow
    console.error("[Audit] Failed to log event:", error);
  }
}

/**
 * Query audit logs for a user with pagination.
 * Only the user themselves or an admin can call this.
 */
export async function getAuditLogs(
  userId: string,
  limit = 50,
  offset = 0,
) {
  const [logs, countResult] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(auditLog)
      .where(eq(auditLog.userId, userId)),
  ]);

  return {
    logs,
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  };
}

/**
 * Query all audit logs (admin only).
 */
export async function getAdminAuditLogs(
  limit = 100,
  offset = 0,
  action?: AuditAction,
) {
  const condition = action ? eq(auditLog.action, action) : undefined;

  const [logs, countResult] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(condition)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(auditLog)
      .where(condition),
  ]);

  return {
    logs,
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  };
}
