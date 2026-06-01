import { create } from 'zustand'
import { TwinState, TwinActions } from '@/types/twin'

export const useTwinStore = create<TwinState & TwinActions>((set) => ({
  profile: null,
  isGenerating: false,

  setProfile: (profile) => set({ profile }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}))
