'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useSwarmStore } from '@/stores/swarmStore'
import { useTwinStore } from '@/stores/twinStore'
import { buildContext } from '@/lib/aurelius/context'
import { AureliusChat } from './AureliusChat'
import { useAureliusStore } from '@/stores/aureliusStore'
import { Iris } from '../ui/Iris'

export function AureliusHelper() {
  const { isOpen, setOpen } = useAureliusStore()
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
      {/* Buton plutitor */}
      <div className="fixed bottom-6 right-6 z-50">
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full border border-copper animate-ripple pointer-events-none" />
            <span className="absolute inset-0 rounded-full border border-copper animate-ripple-delay pointer-events-none" />
          </>
        )}
        <motion.button
          className="relative w-14 h-14 rounded-full bg-obsidian-mid border border-copper/30 hover:border-copper flex items-center justify-center overflow-hidden luxury-shadow transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!isOpen)}
        >
          <Iris size={32} animated={isActive || isOpen} />
        </motion.button>
      </div>

      {/* Pop-up contextual */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glass-deep luxury-shadow overflow-hidden"
            style={{ borderRadius: '1.5rem' }}
          >
            {/* Header */}
            <div className="bg-obsidian-mid p-4 border-b border-copper/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Iris size={20} animated />
                <span className="text-cream font-serif tracking-widest text-sm uppercase">Aurelius</span>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="text-cream/40 hover:text-cream transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Area */}
            <div className="p-4 bg-obsidian/95 backdrop-blur-xl">
              <AureliusChat context={context} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
