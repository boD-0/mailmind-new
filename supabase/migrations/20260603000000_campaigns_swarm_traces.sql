-- ══════════════════════════════════════════════════════════════════════════════
-- CAMPAIGNS + SWARM_TRACES — Fix for PGRST205 "table not in schema cache"
-- Created: 2026-06-03
--
-- The original init_schema (20260508000000) defined these tables with
-- user_id uuid REFERENCES profiles(id), but the app now uses Better-Auth
-- which stores user IDs as text. This migration creates the tables with
-- text user_id to match the actual code.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── CAMPAIGNS ────────────────────────────────────────────────────────────────
-- Core table for AI swarm email campaigns. Accessed via Supabase client
-- throughout the app (dashboard, swarm launch/approve/resume, analytics, etc.)
CREATE TABLE IF NOT EXISTS campaigns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  title             text NOT NULL,
  prospect_name     text,
  prospect_url      text,
  status            text NOT NULL DEFAULT 'draft',
  -- Status lifecycle:
  --   'draft' → 'swarm_running' → 'consensus_reached' | 'awaiting_approval' | 'ready_for_copywriter' → 'completed' | 'error'
  --   'exported' after email is sent
  swarm_params      jsonb DEFAULT '{}',
  -- { tone_aggressiveness, risk_tolerance, research_depth, persona_strictness }
  research_data     jsonb DEFAULT '{}',
  twin_profile      jsonb DEFAULT '{}',
  strategy          jsonb DEFAULT '{}',
  email_draft       text,
  confidence_score  integer DEFAULT 0,
  brand_context     jsonb DEFAULT '{}',
  swarm_mode        text DEFAULT 'deep',
  -- 'fast' | 'deep'
  project_id        uuid,
  -- Optional link to Drizzle-managed projects table for deadline tracking
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ── SWARM_TRACES ─────────────────────────────────────────────────────────────
-- Full execution trace per swarm run. Stores agent-by-agent log and final
-- scores. Queried by the dashboard activity feed.
CREATE TABLE IF NOT EXISTS swarm_traces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id           text NOT NULL,
  run_index         integer NOT NULL DEFAULT 1,
  -- How many simulations have been run on this campaign
  trace_log         jsonb NOT NULL DEFAULT '[]',
  -- shape: [{ agent, status, message, confidence_delta, timestamp }, ...]
  final_scores      jsonb NOT NULL DEFAULT '{}',
  -- shape: { curiosity, interest, irritability, trust, urgency_felt, confidence }
  twin_snapshot     jsonb DEFAULT '{}',
  -- DigitalTwin snapshot at time of run
  created_at        timestamptz DEFAULT now()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_updated ON campaigns(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_swarm_traces_user_id ON swarm_traces(user_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_campaign_id ON swarm_traces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_created_at ON swarm_traces(created_at);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- NOTE: The app uses Better-Auth (text IDs), not Supabase Auth (UUID auth.uid()).
-- RLS policies using auth.uid() would block all queries. Authorization is
-- handled at the application layer via requireAuth() + verifyOwnership().
-- Enable RLS only when a Better-Auth ↔ Supabase bridge is implemented.
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_traces ENABLE ROW LEVEL SECURITY;

-- Permissive policies: allow all operations via service role and authenticated
-- sessions. Application-layer auth (Better-Auth) handles ownership checks.
CREATE POLICY "campaigns_service_all" ON campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "traces_service_all" ON swarm_traces
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── REALTIME ─────────────────────────────────────────────────────────────────
-- Enables Supabase Realtime broadcasts for live swarm progress in the War Room.
-- Wrapped in DO blocks to be idempotent (safe to re-run).
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE swarm_traces;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
