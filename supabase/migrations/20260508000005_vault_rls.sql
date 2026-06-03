-- ── 1. CREARE TABEL VAULT_DOCUMENTS (Dacă lipsește) ───────────────
CREATE TABLE IF NOT EXISTS vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text,
  created_at timestamptz DEFAULT now()
);

-- ── 2. ACTIVARE ROW LEVEL SECURITY ─────────────────────────────────
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;

-- ── 3. POLITICI DE ACCES (RLS) ─────────────────────────────────────

-- Users can SELECT only their own documents
CREATE POLICY "vault_documents_self_select" ON vault_documents 
  FOR SELECT USING (user_id = auth.uid());

-- Users can INSERT only their own documents
CREATE POLICY "vault_documents_self_insert" ON vault_documents 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can UPDATE only their own documents
CREATE POLICY "vault_documents_self_update" ON vault_documents 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can DELETE only their own documents
CREATE POLICY "vault_documents_self_delete" ON vault_documents 
  FOR DELETE USING (user_id = auth.uid());