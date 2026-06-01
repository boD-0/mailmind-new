-- ⚠️ NOTE (2026-05-21): This migration references auth.users(id) which is Supabase Auth (UUID).
-- The Drizzle/Neon schema in src/db/schema.ts now defines api_usage + api_usage_daily
-- with Better-Auth text IDs. Use ONE system:
--   - Drizzle (Neon PostgreSQL):  npx drizzle-kit push
--   - Supabase:  supabase db push
-- These tables should NOT exist in both databases.
--
-- API_USAGE: Tracks per-user API consumption for security & RLS
create table if not exists api_usage (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  endpoint        text not null,           -- e.g. '/api/aurelius/chat', '/api/swarm/launch'
  method          text not null default 'POST',
  tokens_used     integer default 0,
  request_count   integer default 1,
  status_code     integer default 200,
  user_agent      text,
  ip_address      text,
  created_at      timestamptz default now()
);

-- Index for fast per-user aggregation
create index idx_api_usage_user_id on api_usage (user_id);
create index idx_api_usage_created_at on api_usage (created_at);
create index idx_api_usage_endpoint on api_usage (endpoint);

-- RLS: users can only view their own API usage (backend writes via service role)
alter table api_usage enable row level security;
create policy "api_usage_self_select" on api_usage for select using (user_id = auth.uid());

-- API_USAGE_DAILY: Pre-aggregated daily rollups for faster dashboard queries
create table if not exists api_usage_daily (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            date not null,
  endpoint        text not null,
  total_requests  integer default 0,
  total_tokens    integer default 0,
  unique (user_id, date, endpoint)
);

-- RLS for daily rollups: users can only view their own

alter table api_usage_daily enable row level security;
create policy "api_usage_daily_self_select" on api_usage_daily for select using (user_id = auth.uid());
