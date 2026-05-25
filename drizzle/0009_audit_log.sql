-- Migration: audit_log table
-- Tracks security-relevant actions for compliance & incident investigation.

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" TEXT,
  "metadata" JSONB,
  "ip_address" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_audit_log_user_id" ON "audit_log"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_log_action" ON "audit_log"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_log_created_at" ON "audit_log"("created_at");
