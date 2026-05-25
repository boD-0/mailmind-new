import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@/lib/supabase/server";

/**
 * Pipeline-ul de ingestie RAG: Document -> Chunks -> Embeddings -> pgvector.
 * Suportă text simplu și PDF (via pdf-parse).
 */
export async function ingestDocument(
  fileContent: string,
  fileName: string,
  userId: string,
  campaignId?: string
) {
  const supabase = await createClient();

  // 1. Inițializăm Documentul în DB
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      campaign_id: campaignId || null,
      title: fileName,
      file_type: fileName.split('.').pop() || 'text'
    })
    .select()
    .single();

  if (docError) throw docError;

  // 2. Splitter pentru text — chunk mai mic (512) pentru retrieval mai precis
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 64,
  });

  const chunks = await splitter.splitText(fileContent);

  if (chunks.length === 0) {
    return { success: true, documentId: doc.id, totalChunks: 0 };
  }

  // 3. Generăm Embeddings folosind OpenAI (batch pentru performanță)
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
  });

  const vectors = await embeddings.embedDocuments(chunks);

  // 4. Salvăm Chunks în pgvector (batch de max 50 pentru a evita overhead)
  const BATCH_SIZE = 50;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE).map((content: string, j: number) => ({
      document_id: doc.id,
      user_id: userId,
      content,
      embedding: vectors[i + j],
      metadata: { source: fileName, chunk_index: i + j }
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(batch);

    if (chunkError) throw chunkError;
  }

  return { success: true, documentId: doc.id, totalChunks: chunks.length };
}

/**
 * Parsează un fișier PDF și returnează textul extras.
 * Folosește pdf-parse pentru extragerea textului din buffer.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse types declare PDFParse as a class, but at runtime it's a callable async function.
    // Use a specific type assertion instead of `any` to maintain type safety.
    const pdfParseModule = await import("pdf-parse");
    const PDFParse = pdfParseModule.PDFParse as unknown as (buf: Buffer) => Promise<{ text: string }>;
    const data = await PDFParse(buffer);
    return data.text;
  } catch {
    throw new Error("Failed to parse PDF. Ensure the file is a valid PDF.");
  }
}

/**
 * Caută chunk-uri similare folosind pgvector similarity search.
 * Returnează cele mai relevante chunk-uri pentru un query dat.
 */
export async function querySimilarChunks(
  query: string,
  userId: string,
  options?: {
    matchThreshold?: number; // 0-1, default 0.7
    matchCount?: number;     // default 5
  }
): Promise<Array<{ id: string; content: string; metadata: unknown; similarity: number }>> {
  const threshold = options?.matchThreshold ?? 0.7;
  const count = options?.matchCount ?? 5;

  const supabase = await createClient();

  // 1. Generează embedding pentru query
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
  });

  const [queryEmbedding] = await embeddings.embedDocuments([query]);
  if (!queryEmbedding) return [];

  // 2. Apelează funcția PostgreSQL match_document_chunks
  const { data, error } = await supabase
    .rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: count,
      p_user_id: userId,
    });

  if (error) {
    console.error("Similarity search error:", error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    metadata: row.metadata,
    similarity: row.similarity as number,
  }));
}
