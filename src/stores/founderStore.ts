import { create } from 'zustand'

interface SwarmParams {
  tone_aggressiveness: number
  risk_tolerance: number
  research_depth: 'shallow' | 'standard' | 'deep'
  persona_strictness: number
}

interface FounderState {
  isFounderMode: boolean
  maintenanceMode: boolean
  swarmParams: SwarmParams
  systemStats: {
    totalSwarms: number
    activeUsers: number
    dataIngested: string
    systemHealth: string
  }
}

interface FounderActions {
  setFounderMode: (isFounder: boolean) => void
  setMaintenanceMode: (isMaintenance: boolean) => void
  updateSwarmParams: (params: Partial<SwarmParams>) => void
  updateStats: (stats: Partial<FounderState['systemStats']>) => void
}

export const useFounderStore = create<FounderState & FounderActions>((set) => ({
  isFounderMode: false,
  maintenanceMode: false,
  swarmParams: {
    tone_aggressiveness: 5,
    risk_tolerance: 5,
    research_depth: 'standard',
    persona_strictness: 7,
  },
  systemStats: {
    totalSwarms: 1284,
    activeUsers: 452,
    dataIngested: '84.2 GB',
    systemHealth: '99.9%',
  },

  setFounderMode: (isFounder) => set({ isFounderMode: isFounder }),
  setMaintenanceMode: (isMaintenance) => set({ maintenanceMode: isMaintenance }),
  updateSwarmParams: (params) => set((state) => ({
    swarmParams: { ...state.swarmParams, ...params }
  })),
  updateStats: (stats) => set((state) => ({
    systemStats: { ...state.systemStats, ...stats }
  })),
}))
