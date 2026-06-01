import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { executeSwarm } from "@/lib/inngest/functions";

/**
 * Inngest API endpoint — handles function registration and event ingestion.
 *
 * Mounted at: POST /api/inngest
 * Serves: GET, POST, PUT (Inngest dev server syncing)
 *
 * Security: The Inngest SDK validates the signing key automatically.
 * Only authenticated Inngest requests can invoke functions.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeSwarm],
});