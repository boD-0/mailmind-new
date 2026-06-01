import { Inngest } from "inngest";

/**
 * Inngest client for asynchronous swarm execution queues.
 *
 * Gracefully degrades to a no-op mock when INNGEST_EVENT_KEY is not set,
 * so the app works without Inngest during development or when the env var
 * is missing.
 */

function createInngestClient(): Inngest {
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
