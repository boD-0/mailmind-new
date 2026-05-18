import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from './client';
import { AgentMessage } from '@/types/swarm';

/**
 * Publică un update de la un agent pe canalul Realtime al proiectului.
 * Folosește Service Role pentru a asigura livrarea de pe server.
 */
export async function broadcastAgentUpdate(projectId: string, payload: AgentMessage) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const channel = supabase.channel(`swarm:${projectId}`);
  
  await channel.send({
    type: 'broadcast',
    event: 'agent_update',
    payload
  });
}

/**
 * Abonează un client la update-urile unui Swarm.
 */
export function subscribeToSwarm(projectId: string, onUpdate: (payload: AgentMessage) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`swarm:${projectId}`)
    .on('broadcast', { event: 'agent_update' }, ({ payload }: { payload: AgentMessage }) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
