-- ══════════════════════════════════════════════════════════════════════════════
-- IDEAS TABLE — Fix schema mismatch with application code
-- Created: 2026-06-03
--
-- The original init_schema (20260508000000) defined this table with
-- columns: content (text), tags (text[]), source (text)
-- But the application code uses: title (text), body (text), tag (text)
-- This migration creates the table with columns matching the actual code.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ideas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL,
  title             text NOT NULL,
  body              text,
  tag               text,
  campaign_id       uuid,
  -- Optional link to campaigns table (not used by current code but kept
  -- for future "launch swarm from idea" workflow)
  created_at        timestamptz DEFAULT now()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Same approach as campaigns/swarm_traces: Better-Auth handles auth at
-- the application layer, so RLS uses permissive policies.
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ideas_service_all" ON ideas
  FOR ALL
  USING (true)
  WITH CHECK (true);
