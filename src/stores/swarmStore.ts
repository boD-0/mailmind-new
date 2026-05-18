import { create } from 'zustand'
import { SwarmState, SwarmActions, AgentMessage } from '@/types/swarm'

export const useSwarmStore = create<SwarmState & SwarmActions>((set) => ({
  status: 'idle',
  traceLogs: [],
  confidenceScore: 0,
  activeAgent: null,
  projectId: null,

  addAgentMessage: (message: AgentMessage) =>
    set((state) => ({
      traceLogs: [...state.traceLogs, message],
      confidenceScore: Math.min(100, state.confidenceScore + (message.confidence_delta || 0)),
    })),

  setStatus: (status) => set({ status }),
  setConfidenceScore: (score) => set({ confidenceScore: score }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  resetSwarm: () => set({
    status: 'idle',
    traceLogs: [],
    confidenceScore: 0,
    activeAgent: null,
  }),
}))
