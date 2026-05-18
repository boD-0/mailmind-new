-- Tabela pentru aprobările Klaviyo
create table if not exists klaviyo_approvals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id),
  campaign_id      uuid references campaigns(id),
  prospect_email   text not null,
  approved_at      timestamptz,   -- NULL dacă nu e aprobat încă
  synced_at        timestamptz,   -- NULL dacă nu a fost trimis la Klaviyo
  created_at       timestamptz default now()
);

alter table klaviyo_approvals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'klaviyo_self' and tablename = 'klaviyo_approvals'
  ) then
    create policy "klaviyo_self" on klaviyo_approvals for all using (user_id = auth.uid());
  end if;
end $$;
