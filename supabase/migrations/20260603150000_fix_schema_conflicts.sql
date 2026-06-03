-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: Schema mismatch between Supabase migrations and Drizzle schema
-- Created: 2026-06-03
--
-- Problem: Earlier Supabase migrations created tables with uuid user_id
-- (referencing profiles/auth.users) but the app uses Better-Auth with text IDs.
-- CREATE TABLE IF NOT EXISTS silently skipped the corrected tables from
-- migrations 20260603000000 and 20260603000001.
--
-- This migration drops and recreates the affected tables with the correct
-- schema matching src/db/schema.ts (Drizzle).
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Drop old RLS policies that depend on tables being dropped ────────────────
DROP POLICY IF EXISTS "campaigns_self" ON campaigns;
DROP POLICY IF EXISTS "campaigns_service_all" ON campaigns;
DROP POLICY IF EXISTS "traces_self" ON swarm_traces;
DROP POLICY IF EXISTS "traces_service_all" ON swarm_traces;
DROP POLICY IF EXISTS "ideas_self" ON ideas;
DROP POLICY IF EXISTS "ideas_service_all" ON ideas;

-- Remove from realtime before drop
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE campaigns;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE swarm_traces;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- CAMPAIGNS — text user_id (Better-Auth), no FK to profiles
-- ══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  title             text NOT NULL,
  prospect_name     text,
  prospect_url      text,
  status            text NOT NULL DEFAULT 'draft',
  swarm_params      jsonb DEFAULT '{}',
  research_data     jsonb DEFAULT '{}',
  twin_profile      jsonb DEFAULT '{}',
  strategy          jsonb DEFAULT '{}',
  email_draft       text,
  confidence_score  integer DEFAULT 0,
  brand_context     jsonb DEFAULT '{}',
  swarm_mode        text DEFAULT 'deep',
  project_id        uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_updated ON campaigns(user_id, updated_at DESC);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_service_all" ON campaigns
  FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- SWARM_TRACES — text user_id, FK to campaigns
-- ══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS swarm_traces CASCADE;
CREATE TABLE swarm_traces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id           text NOT NULL,
  run_index         integer NOT NULL DEFAULT 1,
  trace_log         jsonb NOT NULL DEFAULT '[]',
  final_scores      jsonb NOT NULL DEFAULT '{}',
  twin_snapshot     jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swarm_traces_user_id ON swarm_traces(user_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_campaign_id ON swarm_traces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_created_at ON swarm_traces(created_at);

ALTER TABLE swarm_traces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "traces_service_all" ON swarm_traces
  FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE swarm_traces;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- IDEAS — text user_id, columns: title, body, tag (not content/tags/source)
-- ══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS ideas CASCADE;
CREATE TABLE ideas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  title             text NOT NULL,
  body              text,
  tag               text,
  campaign_id       uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ideas_service_all" ON ideas
  FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- VAULT_DOCUMENTS — text user_id, columns matching Drizzle schema
-- (file_name, file_key, file_url, file_size, mime_type, project_id)
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "vault_documents_self_select" ON vault_documents;
DROP POLICY IF EXISTS "vault_documents_self_insert" ON vault_documents;
DROP POLICY IF EXISTS "vault_documents_self_update" ON vault_documents;
DROP POLICY IF EXISTS "vault_documents_self_delete" ON vault_documents;

DROP TABLE IF EXISTS vault_documents CASCADE;
CREATE TABLE vault_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_name   text NOT NULL,
  file_key    text NOT NULL,
  file_url    text NOT NULL,
  file_size   integer,
  mime_type   text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vault_documents_service_all" ON vault_documents
  FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- API_USAGE — uuid id (defaultRandom), text user_id
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "api_usage_self_select" ON api_usage;
DROP POLICY IF EXISTS "api_usage_daily_self_select" ON api_usage_daily;

DROP TABLE IF EXISTS api_usage_daily CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;

CREATE TABLE api_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL,
  endpoint        text NOT NULL,
  method          text NOT NULL DEFAULT 'POST',
  tokens_used     integer DEFAULT 0,
  request_count   integer DEFAULT 1,
  status_code     integer DEFAULT 200,
  ip_address      text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_usage_service_all" ON api_usage
  FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- API_USAGE_DAILY — uuid id (defaultRandom), text user_id
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE api_usage_daily (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL,
  date            date NOT NULL,
  endpoint        text NOT NULL,
  total_requests  integer DEFAULT 0,
  total_tokens    integer DEFAULT 0,
  UNIQUE (user_id, date, endpoint)
);

ALTER TABLE api_usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_usage_daily_service_all" ON api_usage_daily
  FOR ALL USING (true) WITH CHECK (true);
