'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAureliusStore, AureliusMessage } from '@/stores/aureliusStore'
import { AureliusContext } from '@/lib/aurelius/context'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ImageIcon, FileInput, MonitorIcon, CircleUserRound,
  ArrowUpIcon, Paperclip, PlusIcon, Sparkles
} from 'lucide-react'

interface AureliusChatProps {
  context: AureliusContext
}

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

/* ── Action Buttons ── */

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/50 hover:text-white/80 transition-colors text-[11px]"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

/* ── AureliusChat Component ── */

export function AureliusChat({ context }: AureliusChatProps) {
  const { history, addMessage, isThinking, setThinking } = useAureliusStore()
  const [input, setInput] = useState('')
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 44, maxHeight: 120 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showActions, setShowActions] = useState(true)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isThinking) return

    const userMsg: AureliusMessage = { role: 'user', content: input }
    addMessage(userMsg)
    setInput('')
    adjustHeight(true)
    setThinking(true)
    setShowActions(false)

    // Simulate AI response with context-aware reply
    setTimeout(() => {
      const responseMap: Record<string, string> = {
        swarm_active: `Swarm-ul rulează cu încredere ${context.hint.split(':')[1]?.trim() || 'ridicată'}. Recomand să aștepți finalizarea înainte de a trece la pasul următor.`,
        approval_needed: 'Strategia este gata de revizuire. Verifică propunerile agenților și apasă Approve când ești mulțumit.',
        twin_insight: `Pe baza profilului Digital Twin: ${context.hint}. Acest insight va ghida tonul și unghiul campaniei.`,
        onboarding: 'Configurează valorile brandului tău — acestea vor defini personalitatea întregului Swarm în campaniile viitoare.',
        idle: 'Sunt pregătit să te asist. Pot optimiza sesiunile Swarm, analiza profiluri Digital Twin sau oferi recomandări strategice. Cu ce începem?',
      }
      const assistantMsg: AureliusMessage = {
        role: 'assistant',
        content: (responseMap[context.mode] || responseMap.idle) as string
      }
      addMessage(assistantMsg)
      setThinking(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 custom-scrollbar" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? 'bg-[#ff5f5f] text-white rounded-tr-none'
                  : 'bg-white/5 text-white/80 border border-white/10 rounded-tl-none'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'assistant' && (
                    <Sparkles size={12} className="text-[#ff5f5f]" />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-50">
                    {msg.role === 'user' ? 'You' : 'Aurelius'}
                  </span>
                </div>
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
              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#ff5f5f] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#ff5f5f] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-[#ff5f5f] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context indicator */}
      {context.mode !== 'idle' && (
        <div className="mb-2 px-3 py-1.5 bg-[#ff5f5f]/10 rounded-lg border border-[#ff5f5f]/20">
          <span className="text-[10px] font-medium text-[#ff5f5f] uppercase tracking-wider">
            ● {context.mode === 'swarm_active' ? 'Swarm Active' :
               context.mode === 'approval_needed' ? 'Approval Needed' :
               context.mode === 'twin_insight' ? 'Digital Twin Insight' :
               context.mode === 'onboarding' ? 'Onboarding' : ''}
          </span>
        </div>
      )}

      {/* Input Area - v0-ai-chat style */}
      <div className="relative bg-white/5 rounded-xl border border-white/10">
        <div className="overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aurelius anything..."
            className={cn(
              "w-full px-4 py-3",
              "resize-none",
              "bg-transparent",
              "border-none",
              "text-white text-sm",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-white/30 placeholder:text-sm",
              "min-h-[44px]"
            )}
            style={{ overflow: 'hidden' }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="group p-1.5 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Paperclip className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/30 hidden group-hover:inline transition-opacity">
                Attach
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded-lg text-[10px] text-white/40 transition-colors border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center justify-between gap-1"
            >
              <PlusIcon className="w-3 h-3" />
              Context
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isThinking}
              className={cn(
                "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-white/10 flex items-center justify-between gap-1",
                input.trim()
                  ? "bg-[#ff5f5f] text-white border-[#ff5f5f] hover:bg-red-500"
                  : "text-white/40"
              )}
            >
              <ArrowUpIcon className={cn("w-4 h-4", input.trim() ? "text-white" : "text-white/40")} />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      {showActions && history.length <= 1 && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <ActionButton
            icon={<ImageIcon className="w-3 h-3" />}
            label="Analyze Screenshot"
          />
          <ActionButton
            icon={<FileInput className="w-3 h-3" />}
            label="Import Strategy"
          />
          <ActionButton
            icon={<MonitorIcon className="w-3 h-3" />}
            label="Optimize Campaign"
          />
          <ActionButton
            icon={<CircleUserRound className="w-3 h-3" />}
            label="Twin Insights"
          />
        </div>
      )}
    </div>
  )
}
