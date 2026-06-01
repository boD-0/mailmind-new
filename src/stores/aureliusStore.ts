import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'aurelius-history'
const WELCOME_MESSAGE: AureliusMessage = {
  role: 'assistant',
  content: 'Bună ziua. Sunt Aurelius. Cum pot optimiza sesiunea ta?'
}

export interface AureliusMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AureliusStore {
  isOpen: boolean
  isThinking: boolean
  /** Persisted conversation history */
  history: AureliusMessage[]
  streamingContent: string
  error: string | null
  _hydrated: boolean
  setOpen: (v: boolean) => void
  setThinking: (v: boolean) => void
  addMessage: (msg: AureliusMessage) => void
  clearHistory: () => void
  setStreamingContent: (v: string) => void
  appendStreamingContent: (v: string) => void
  setError: (v: string | null) => void
}

/**
 * Only persist the `history` array — transient state (isOpen, streaming, etc.)
 * is excluded via the `partialize` option.
 */
export const useAureliusStore = create<AureliusStore>()(
  persist(
    (set) => ({
      isOpen: false,
      isThinking: false,
      history: [WELCOME_MESSAGE],
      streamingContent: '',
      error: null,
      _hydrated: false,

      setOpen: (isOpen) => set({ isOpen }),
      setThinking: (isThinking) => set({ isThinking }),

      addMessage: (msg) => set((state) => ({
        history: [...state.history, msg]
      })),

      clearHistory: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
        set({
          history: [WELCOME_MESSAGE],
          streamingContent: '',
          error: null,
        })
      },

      setStreamingContent: (streamingContent) => set({ streamingContent }),
      appendStreamingContent: (chunk) => set((state) => ({
        streamingContent: state.streamingContent + chunk
      })),
      setError: (error) => set({ error }),
    }),
    {
      name: STORAGE_KEY,
      // Only persist `history` — everything else is session-only
      partialize: (state) => ({ history: state.history }),
      // Merge persisted history back on rehydrate
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AureliusStore>),
        _hydrated: true,
      }),
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        if (version === 0) {
          // Future-proofing: handle format migrations here
          return { history: [WELCOME_MESSAGE] } as Partial<AureliusStore>
        }
        return persisted as Partial<AureliusStore>
      },
    }
  )
)

