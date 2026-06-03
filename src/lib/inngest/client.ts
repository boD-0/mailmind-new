import { Inngest } from "inngest";

/**
 * Type map of all Inngest events used in the application.
 */
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

/**
 * Inngest client for asynchronous swarm execution queues.
 *
 * Gracefully degrades to a no-op mock when INNGEST_EVENT_KEY is not set,
 * so the app works without Inngest during development or when the env var
 * is missing.
 */

function createInngestClient(): Inngest<SwarmEvents> {
  const eventKey = process.env.INNGEST_EVENT_KEY;

  if (!eventKey) {
    console.warn(
      "[Inngest] INNGEST_EVENT_KEY not set — background job queue disabled. " +
        "Swarm executions will run inline (may hit Vercel 60s timeout)."
    );
  }

  return new Inngest<SwarmEvents>({
    id: "mailmind",
    eventKey: eventKey || "dev-fallback",
  });
}

export const inngest = createInngestClient();
