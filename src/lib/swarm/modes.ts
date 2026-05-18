import { AgentName } from "@/types/swarm";

export type SwarmModeType = 'fast' | 'deep';

export interface SwarmModeConfig {
  agents: AgentName[]
  skip_twin: boolean
  skip_approval: boolean
  research_depth: 'shallow' | 'deep'
}

export const SWARM_MODES: Record<SwarmModeType, SwarmModeConfig> = {
  fast: {
    agents: ['researcher', 'copywriter'],
    skip_twin: true,
    skip_approval: true, // Fast Scan nu are aprobare manuală
    research_depth: 'shallow'
  },
  deep: {
    agents: ['researcher', 'psychologist', 'strategist', 'copywriter'],
    skip_twin: false,
    skip_approval: false, // Deep Simulation are aprobare obligatorie
    research_depth: 'deep'
  }
};

export function getSwarmMode(subscription: 'fast_scan' | 'deep_simulation'): SwarmModeConfig {
  return SWARM_MODES[subscription === 'fast_scan' ? 'fast' : 'deep'];
}
