import { Inngest } from "inngest";

export type SwarmEvents = {
  "swarm/execute": {
    data: {
      campaignId: string;
      prospectName: string;
      prospectUrl: string;
      brandContext: Record<string, unknown>;
      swarmMode: "fast" | "deep";
      userId: string;
      plan: string;
    };
  };
};

function createInngestClient() {
  const eventKey = process.env.INNGEST_EVENT_KEY;

  if (!eventKey) {
    console.warn(
      "[Inngest] INNGEST_EVENT_KEY not set — background job queue disabled. " +
        "Swarm executions will run inline (may hit Vercel 60s timeout)."
    );
  }

  return new Inngest({
    id: "mailmind",
    eventKey: eventKey || "dev-fallback",
  });
}

export const inngest = createInngestClient();