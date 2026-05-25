-- Prospects table — internal database of contacted prospects with OCEAN profiles and contact history
CREATE TABLE IF NOT EXISTS "prospects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "company" TEXT,
  "title" TEXT,
  "linkedin_url" TEXT,
  "oceano_scores" JSONB,
  "tags" JSONB DEFAULT '[]',
  "notes" TEXT,
  "last_contacted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_prospects_user_id" ON "prospects"("user_id");
CREATE INDEX IF NOT EXISTS "idx_prospects_email" ON "prospects"("email");
CREATE INDEX IF NOT EXISTS "idx_prospects_company" ON "prospects"("company");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_prospects_user_email" ON "prospects"("user_id", "email") WHERE "email" IS NOT NULL;
