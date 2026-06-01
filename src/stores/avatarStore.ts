import { create } from 'zustand'
import { updateAvatar } from '@/app/actions/profile'

interface AvatarStore {
  selectedAvatarId: number
  initialized: boolean
  saving: boolean
  initAvatar: (id: number) => void
  setSelectedAvatar: (id: number) => Promise<void>
}

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  selectedAvatarId: 1,
  initialized: false,
  saving: false,
  initAvatar: (id) => set({ selectedAvatarId: id, initialized: true }),
  setSelectedAvatar: async (id) => {
    set({ selectedAvatarId: id, saving: true })
    try {
      await updateAvatar(id)
    } catch {
      // Silently fail — avatar will update next time they visit
    } finally {
      set({ saving: false })
    }
  },
}))
