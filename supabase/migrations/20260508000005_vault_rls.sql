-- VAULT_DOCUMENTS: RLS policies for secure file storage
-- Enable RLS if not already active
alter table if exists vault_documents enable row level security;

-- Users can SELECT only their own documents
create policy "vault_documents_self_select" on vault_documents 
  for select using (user_id = auth.uid());

-- Users can INSERT only their own documents
create policy "vault_documents_self_insert" on vault_documents 
  for insert with check (user_id = auth.uid());

-- Users can UPDATE only their own documents
create policy "vault_documents_self_update" on vault_documents 
  for update using (user_id = auth.uid());

-- Users can DELETE only their own documents
create policy "vault_documents_self_delete" on vault_documents 
  for delete using (user_id = auth.uid());

-- NOTE: api_usage and api_usage_daily RLS is handled in migration 20260508000004_api_usage_rls.sql
-- NOTE: This migration targets Supabase tables. The Drizzle/Neon schema uses Drizzle-managed tables.
