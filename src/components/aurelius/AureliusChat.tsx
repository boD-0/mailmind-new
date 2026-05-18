'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAureliusStore, AureliusMessage } from '@/stores/aureliusStore'
import { AureliusContext } from '@/lib/aurelius/context'

interface AureliusChatProps {
  context: AureliusContext
}

export function AureliusChat({ context }: AureliusChatProps) {
  const { history, addMessage, isThinking, setThinking } = useAureliusStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const userMsg: AureliusMessage = { role: 'user', content: input }
    addMessage(userMsg)
    setInput('')
    setThinking(true)

    // Simulate AI response for now
    setTimeout(() => {
      const assistantMsg: AureliusMessage = { 
        role: 'assistant', 
        content: `Înțeleg. Bazat pe contextul actual (${context.mode}), iată recomandarea mea: ${context.hint}. Cum altfel te mai pot ajuta?` 
      }
      addMessage(assistantMsg)
      setThinking(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="grow overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-copper text-obsidian rounded-tr-none' 
                  : 'bg-obsidian-light text-cream/90 border border-copper/20 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-obsidian-light p-3 rounded-2xl rounded-tl-none border border-copper/20">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-copper rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-copper rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-copper rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Întreabă-l pe Aurelius..."
          className="w-full bg-obsidian-mid border border-copper/30 rounded-full py-3 px-5 pr-12 text-sm text-cream focus:outline-none focus:border-copper transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-copper text-obsidian flex items-center justify-center disabled:opacity-50"
        >
          ↑
        </button>
      </form>
    </div>
  )
}
