import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@/lib/supabase/server";

/**
 * Pipeline-ul de ingestie RAG: Document -> Chunks -> Embeddings -> pgvector.
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

  // 2. Splitter pentru text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(fileContent);

  // 3. Generăm Embeddings folosind OpenAI
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
  });

  const vectors = await embeddings.embedDocuments(chunks);

  // 4. Salvăm Chunks în pgvector
  const chunkInserts = chunks.map((content: string, i: number) => ({
    document_id: doc.id,
    user_id: userId,
    content,
    embedding: vectors[i],
    metadata: { source: fileName, chunk_index: i }
  }));

  const { error: chunkError } = await supabase
    .from('document_chunks')
    .insert(chunkInserts);

  if (chunkError) throw chunkError;

  return { success: true, documentId: doc.id, totalChunks: chunks.length };
}
