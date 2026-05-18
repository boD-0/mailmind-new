import { ChatOpenAI } from "@langchain/openai";

export function getAgentModel() {
  return new ChatOpenAI({
    apiKey: process.env.TOGETHER_AI_API_KEY,
    configuration: {
      baseURL: "https://api.together.xyz/v1",
    },
    modelName: "meta-llama/Llama-3-70b-chat-hf",
    temperature: 0.7,
  });
}
