import { create } from 'zustand'

export interface AureliusMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AureliusStore {
  isOpen: boolean
  isThinking: boolean
  history: AureliusMessage[]
  setOpen: (v: boolean) => void
  setThinking: (v: boolean) => void
  addMessage: (msg: AureliusMessage) => void
  clearHistory: () => void
}

export const useAureliusStore = create<AureliusStore>((set) => ({
  isOpen: false,
  isThinking: false,
  history: [
    { role: 'assistant', content: 'Bună ziua. Sunt Aurelius. Cum pot optimiza sesiunea ta?' }
  ],
  setOpen: (isOpen) => set({ isOpen }),
  setThinking: (isThinking) => set({ isThinking }),
  addMessage: (msg) => set((state) => ({ 
    history: [...state.history, msg] 
  })),
  clearHistory: () => set({ 
    history: [{ role: 'assistant', content: 'Bună ziua. Sunt Aurelius. Cum pot optimiza sesiunea ta?' }] 
  })
}))
