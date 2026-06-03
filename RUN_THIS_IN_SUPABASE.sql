-- ═══════════════════════════════════════════════════════════════
-- MAILMIND — Tabel lipsa (campaigns, swarm_traces, ideas)
-- 
-- CUM SE FOLOSESTE:
-- 1. Deschide Supabase Dashboard: https://supabase.com/dashboard
-- 2. Selecteaza proiectul MailMind (ctbindiegrsyewiudhue)
-- 3. Mergi la SQL Editor (stanga)
-- 4. Copiaza tot codul de mai jos
-- 5. Click "Run"
-- ═══════════════════════════════════════════════════════════════

-- ── CAMPAIGNS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
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
  project_id        uuid,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- ── SWARM_TRACES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS swarm_traces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id           text NOT NULL,
  run_index         integer NOT NULL DEFAULT 1,
  trace_log         jsonb NOT NULL DEFAULT '[]',
  final_scores      jsonb NOT NULL DEFAULT '{}',
  twin_snapshot     jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now()
);

-- ── IDEAS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ideas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  title             text NOT NULL,
  body              text,
  tag               text,
  campaign_id       uuid,
  created_at        timestamptz DEFAULT now()
);

-- ── INDEXE ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_updated ON campaigns(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_user_id ON swarm_traces(user_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_campaign_id ON swarm_traces(campaign_id);
CREATE INDEX IF NOT EXISTS idx_swarm_traces_created_at ON swarm_traces(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_all" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "traces_all" ON swarm_traces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ideas_all" ON ideas FOR ALL USING (true) WITH CHECK (true);

-- ── REALTIME (pentru War Room live updates) ──────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE campaigns; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE swarm_traces; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
