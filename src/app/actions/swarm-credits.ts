"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/gatekeeper";
import { getCreditBalance } from "@/lib/swarm/credits";

export type SwarmCredits = {
  balance: number;
};

/**
 * Returns the user's current swarm credit balance.
 * Used by the SwarmUsageBar component on the dashboard.
 */
export async function getSwarmCredits(): Promise<SwarmCredits> {
  const head = await headers();
  const mockReq = { headers: head } as unknown as Request;
  const user = await requireAuth(mockReq);

  const balance = await getCreditBalance(user.id);

  return { balance };
}
