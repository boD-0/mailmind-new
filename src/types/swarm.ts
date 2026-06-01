export type AgentName = 'researcher' | 'psychologist' | 'strategist' | 'copywriter' | 'consensus' | 'approval_gate' | 'sandbox'

export type SwarmStatus = 'idle' | 'swarm_running' | 'consensus_reached' | 'conflict' | 'awaiting_approval'

export interface AgentMessage {
  agent: AgentName
  status: 'working' | 'done' | 'conflict' | 'idle'
  message: string
  confidence_delta?: number
  timestamp: number
}

export interface SwarmState {
  status: SwarmStatus
  traceLogs: AgentMessage[]
  confidenceScore: number
  activeAgent: AgentName | null
  projectId: string | null
}

export interface SwarmActions {
  addAgentMessage: (message: AgentMessage) => void
  setStatus: (status: SwarmStatus) => void
  setConfidenceScore: (score: number) => void
  setActiveAgent: (agent: AgentName | null) => void
  resetSwarm: () => void
}
