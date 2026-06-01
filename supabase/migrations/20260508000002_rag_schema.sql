-- Activăm extensia vector pentru pgvector
create extension if not exists vector;

-- Tabelă pentru documentele încărcate (metadata)
create table if not exists documents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  campaign_id       uuid references campaigns(id) on delete set null,
  title             text not null,
  source_url        text,
  file_type         text,
  created_at        timestamptz default now()
);

-- Tabelă pentru bucățile de text (chunks) și embedding-urile lor
create table if not exists document_chunks (
  id                uuid primary key default gen_random_uuid(),
  document_id       uuid references documents(id) on delete cascade,
  user_id           uuid references profiles(id) on delete cascade,
  content           text not null,
  metadata          jsonb default '{}',
  embedding         vector(1536), -- 1536 este dimensiunea pentru OpenAI text-embedding-3-small/ada-002
  created_at        timestamptz default now()
);

-- RLS pentru documente și chunks
alter table documents enable row level security;
alter table document_chunks enable row level security;

create policy "documents_self" on documents for all using (user_id = auth.uid());
create policy "chunks_self" on document_chunks for all using (user_id = auth.uid());

-- Index pentru căutare rapidă (HNSW)
create index on document_chunks using hnsw (embedding vector_cosine_ops);

-- Funcție pentru căutare de similaritate (utilizată de RAG)
create or replace function match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.user_id = p_user_id
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
