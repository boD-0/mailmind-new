-- Adăugăm coloane pentru subscripție în tabela profiles
alter table profiles 
add column if not exists subscription_plan text default 'free',
add column if not exists subscription_status text default 'inactive',
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text;

-- Index pentru căutare rapidă după stripe_customer_id
create index if not exists idx_profiles_stripe_customer_id on profiles(stripe_customer_id);
