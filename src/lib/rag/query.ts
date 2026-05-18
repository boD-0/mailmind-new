import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@/lib/supabase/server";

export async function queryKnowledgeBase(query: string, userId: string, limit: number = 5) {
  const supabase = await createClient();
  
  // 1. Generăm embedding pentru query folosind OpenAI
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
  });
  
  const queryVector = await embeddings.embedQuery(query);

  // 2. Apelăm funcția RPC din Supabase pentru Similarity Search
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryVector,
    match_threshold: 0.5,
    match_count: limit,
    p_user_id: userId
  });

  if (error) {
    console.error("Error querying knowledge base:", error);
    return [];
  }

  return data;
}
