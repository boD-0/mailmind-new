'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useSwarmStore } from '@/stores/swarmStore'
import { useTwinStore } from '@/stores/twinStore'
import { buildContext } from '@/lib/aurelius/context'
import { AureliusChat } from './AureliusChat'
import { useAureliusStore } from '@/stores/aureliusStore'
import { Iris } from '../ui/Iris'
import { Sparkles, X, Trash2 } from 'lucide-react'

export function AureliusHelper() {
  const { isOpen, setOpen, clearHistory } = useAureliusStore()
  const swarm = useSwarmStore()
  const twin = useTwinStore()
  const pathname = usePathname()

  // Generează contextul dinamic
  const context = buildContext({ 
    swarm: { 
      status: swarm.status as 'running' | 'awaiting_approval' | 'idle' | 'success' | 'error',
      confidenceScore: swarm.confidenceScore,
      activeAgent: swarm.activeAgent ?? undefined,
    }, 
    twin: { 
      profile: twin.profile ?? undefined,
    }, 
    pathname 
  })

  const isActive = swarm.status === 'swarm_running'

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full border border-copper animate-ripple pointer-events-none" />
            <span className="absolute inset-0 rounded-full border border-copper animate-ripple-delay pointer-events-none" />
          </>
        )}
        <motion.button
          className="relative w-14 h-14 rounded-full bg-white border border-border hover:border-copper/50 flex items-center justify-center overflow-hidden shadow-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!isOpen)}
        >
          <Iris size={32} animated={isActive || isOpen} />
        </motion.button>
      </div>

      {/* Pop-up — AI Assistant style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-[420px] bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
          >
            {/* Header — polished like AI Assistant */}
            <div className="bg-white p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-copper/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-copper" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Aurelius</h2>
                  <p className="text-[10px] text-muted-foreground font-medium">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 bg-background">
              <AureliusChat context={context} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
