import { SwarmState } from "../graph";
import { tavily } from "@tavily/core";
import { broadcastAgentUpdate } from "@/lib/supabase/realtime";
import { ChatOpenAI } from "@langchain/openai";
import { redis, CACHE_TTL } from "@/lib/redis";
import { safeJsonParse } from "@/lib/utils";

export async function researcherAgent(state: SwarmState) {
const { prospect_name, prospect_url, campaign_id } = state;
  const cacheKey = `research:${prospect_url || prospect_name}`;

  const update = {
    agent: 'researcher' as const,
    status: 'working' as const,
    message: `Inițiez research pentru ${prospect_name}...`,
    confidence_delta: 5,
    timestamp: Date.now()
  };

  await broadcastAgentUpdate(campaign_id, update);

  try {
    // 1. Verificăm Cache-ul Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
const doneUpdate = {
        agent: 'researcher' as const,
        status: 'done' as const,
        message: `Research recuperat din cache pentru ${prospect_name}.`,
        confidence_delta: 15,
        timestamp: Date.now()
      };
      await broadcastAgentUpdate(campaign_id, doneUpdate);
      return {
        research_data: cachedData,
        trace_log: [update, doneUpdate]
      };
    }

    // 2. Dacă nu e în cache, rulăm Tavily
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    
    // Căutăm informații despre prospect și companie
    const query = `who is ${prospect_name} at ${prospect_url} latest news and professional background`;
    const searchResult = await tvly.search(query, { 
      searchDepth: "advanced",
      maxResults: 5
    });

    const model = new ChatOpenAI({
      apiKey: process.env.TOGETHER_AI_API_KEY,
      configuration: {
        baseURL: "https://api.together.xyz/v1",
      },
      modelName: "meta-llama/Llama-3-70b-chat-hf",
    });

    const summaryPrompt = `
      Ești un Researcher de elită. Analizează rezultatele căutării pentru prospectul ${prospect_name} (${prospect_url}).
      Extrage:
      1. Fapte cheie despre carieră și companie.
      2. Tonul comunicării lor publice.
      3. Știri recente sau evenimente relevante.
      
      Rezultate căutare:
      ${JSON.stringify(searchResult.results)}
      
      Răspunde în format JSON cu cheile: facts (array), tone (string), news (string).
    `;

    const response = await model.invoke(summaryPrompt);
    const research_data = safeJsonParse(response.content as string, { facts: [], tone: "Neutral", news: "" });

    // 3. Salvăm în Cache
    await redis.set(cacheKey, research_data, { ex: CACHE_TTL });

    const doneUpdate = {
      agent: 'researcher' as const,
      status: 'done' as const,
      message: `Research finalizat pentru ${prospect_name}.`,
      confidence_delta: 15,
      timestamp: Date.now()
    };

    await broadcastAgentUpdate(campaign_id, doneUpdate);

    return {
      research_data,
      trace_log: [update, doneUpdate]
    };
  } catch (error) {
    console.error("Researcher Agent Error:", error);
    const errorUpdate = {
      agent: 'researcher' as const,
      status: 'conflict' as const,
      message: `Eroare la research: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_delta: 0,
      timestamp: Date.now()
    };
    await broadcastAgentUpdate(campaign_id, errorUpdate);
    return {
      trace_log: [update, errorUpdate]
    };
  }
}
