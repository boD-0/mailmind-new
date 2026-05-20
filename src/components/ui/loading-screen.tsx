'use client'

import { Typewriter } from '@/components/ui/auth-fuse'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({
  message = 'Loading your experience...',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-[9999] bg-[#fdfbf7] flex flex-col items-center justify-center'
          : 'flex flex-col items-center justify-center py-24'
      }
    >
      {/* Animated logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full border-2 border-dashed border-[#ff5f5f]/20"
          />
          <div className="w-16 h-16 bg-[#ff5f5f] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200/50">
            <span className="text-white text-2xl font-extrabold tracking-tight">M</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 bg-[#ff5f5f]/10 text-[#ff5f5f] text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            <Typewriter text={message} speed={40} cursor="|" />
          </span>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full bg-[#ff5f5f]"
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      {fullScreen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 text-xs text-gray-400 tracking-wider"
        >
          MailMind <span className="mx-2">·</span> Swarm Intelligence
        </motion.p>
      )}
    </div>
  )
}
