-- PROFILES (extins față de V3.2)
create table profiles (
  id                uuid primary key references auth.users(id),
  email             text not null,
  full_name         text,
  avatar_url        text,
  onboarding_data   jsonb default '{}',
  -- onboarding_data shape:
  -- {
  --   company: { name, industry, url, description },
  --   icp: { industries[], roles[], company_sizes[], pain_points[] },
  --   brand_values: { values[], tone_score: 0-10, metaphors_ok: bool, forbidden_topics[] },
  --   style_memory: { good_email_examples: string[] }
  -- }
  founder_mode      boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- CAMPAIGNS (înlocuiește threads/projects)
create table campaigns (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  title             text not null,
  prospect_url      text,
  prospect_name     text,
  status            text default 'draft',
  -- 'draft' | 'swarm_running' | 'consensus_reached' | 'exported'
  swarm_params      jsonb default '{}',
  -- { tone_aggressiveness, risk_tolerance, research_depth, persona_strictness }
  research_data     jsonb default '{}',
  twin_profile      jsonb default '{}',   -- DigitalTwin complet
  strategy          jsonb default '{}',
  email_draft       text,
  confidence_score  integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- SWARM_TRACES (full trace per run)
create table swarm_traces (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid references campaigns(id) on delete cascade,
  user_id           uuid references profiles(id),
  run_index         integer not null,    -- câte simulări au fost pe această campanie
  -- Full trace: fiecare mesaj al fiecărui agent, în ordine
  trace_log         jsonb not null,
  -- shape: [
  --   { agent, status, message, confidence_delta, timestamp },
  --   ...
  -- ]
  -- Scoruri la momentul final al acestui run
  final_scores      jsonb not null,
  -- shape: { curiosity, interest, irritability, trust, urgency_felt, confidence }
  twin_snapshot     jsonb not null,      -- snapshot DigitalTwin la momentul run-ului
  created_at        timestamptz default now()
);

-- EMPATHY_SIMULATIONS (rezultatele sandbox per draft)
create table empathy_simulations (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid references campaigns(id) on delete cascade,
  swarm_trace_id    uuid references swarm_traces(id),
  user_id           uuid references profiles(id),
  email_draft_hash  text,               -- hash al draft-ului testat
  reaction_map      jsonb not null,
  -- shape: { curiosity, interest, irritability, trust, urgency_felt }
  twin_profile_used jsonb not null,     -- profilul Twin folosit la simulare
  notes             text,               -- observații opționale Founder Mode
  created_at        timestamptz default now()
);

-- IDEAS (păstrat din V3.2, minor update)
create table ideas (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  campaign_id       uuid references campaigns(id),  -- nullable
  content           text not null,
  tags              text[] default '{}',
  source            text,    -- 'ai_extracted' | 'manual' | 'chat'
  created_at        timestamptz default now()
);

-- CHAT_SESSIONS (păstrat din V3.2)
create table chat_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  title             text,
  messages          jsonb default '[]',
  is_chat           boolean default true,
  created_at        timestamptz default now()
);

-- ASSETS (Supabase Storage metadata)
create table assets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  campaign_id       uuid references campaigns(id),
  storage_path      text not null,
  file_name         text not null,
  file_type         text,
  file_size         bigint,
  created_at        timestamptz default now()
);

-- RLS
alter table profiles           enable row level security;
alter table campaigns          enable row level security;
alter table swarm_traces       enable row level security;
alter table empathy_simulations enable row level security;
alter table ideas               enable row level security;
alter table chat_sessions       enable row level security;
alter table assets              enable row level security;

create policy "profiles_self"    on profiles            for all using (id = auth.uid());
create policy "campaigns_self"   on campaigns           for all using (user_id = auth.uid());
create policy "traces_self"      on swarm_traces        for all using (user_id = auth.uid());
create policy "simulations_self" on empathy_simulations for all using (user_id = auth.uid());
create policy "ideas_self"       on ideas               for all using (user_id = auth.uid());
create policy "chats_self"       on chat_sessions       for all using (user_id = auth.uid());
create policy "assets_self"      on assets              for all using (user_id = auth.uid());

-- REALTIME
alter publication supabase_realtime add table campaigns;
alter publication supabase_realtime add table swarm_traces;
