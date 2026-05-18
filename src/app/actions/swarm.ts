'use server'

import { createClient } from "@/lib/supabase/server";
import { resumeSwarmFromCopywriter } from "@/lib/swarm/resume";

export async function approveSwarm(campaignId: string) {
  const supabase = await createClient();

  // 1. Actualizăm statusul campaniei
  const { error } = await supabase.from('campaigns')
    .update({ status: 'swarm_running' })
    .eq('id', campaignId);

  if (error) {
    throw new Error(`Failed to approve swarm: ${error.message}`);
  }

  // 2. Re-pornim graful de la nodul Copywriter
  try {
    await resumeSwarmFromCopywriter(campaignId);
    return { success: true };
  } catch (err) {
    console.error("Error resuming swarm:", err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
