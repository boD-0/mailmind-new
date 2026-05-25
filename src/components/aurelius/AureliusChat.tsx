'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAureliusStore, AureliusMessage } from '@/stores/aureliusStore'
import { AureliusContext } from '@/lib/aurelius/context'
import { useSwarmStore } from '@/stores/swarmStore'
import { getUserProjectProfile } from '@/app/actions/project'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ArrowUpIcon, Paperclip, PlusIcon, Sparkles, AlertCircle
} from 'lucide-react'

interface AureliusChatProps {
  context: AureliusContext
}

interface BrandProfile {
  name: string
  industry: string
  toneOfVoice: string
  targetAudience: string
  context: string
  brandValues: string[]
  painPoints: string[]
}

/* ── useAutoResizeTextarea ── */

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
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

/* ── Typing Dots ── */

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-border shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-copper rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-copper rounded-full animate-bounce [animation-delay:0.15s]" />
          <span className="w-2 h-2 bg-copper rounded-full animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  )
}

/* ── Empty State ── */

function EmptyState({ context }: { context: AureliusContext }) {
  const modeMessages: Record<string, string> = {
    swarm_active: 'Swarm is running. I can provide real-time updates and recommendations.',
    approval_needed: 'Strategy is ready for review. Check the proposals and approve when satisfied.',
    twin_insight: 'I have insights about the Digital Twin. Ask me anything about the prospect profile.',
    onboarding: 'Configure your brand values. I can guide you through each step.',
    idle: 'I\'m ready to assist. Ask me about campaigns, strategy, or anything about MailMind.',
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-copper/10 flex items-center justify-center mb-5">
        <Sparkles className="w-7 h-7 text-copper" />
      </div>
      <h3 className="text-foreground text-lg font-bold mb-2 tracking-tight">
        How can I help you today?
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        {modeMessages[context.mode] || modeMessages.idle}
      </p>

      {context.mode !== 'idle' && (
        <div className="mt-4 px-3 py-1.5 bg-copper/5 rounded-lg border border-copper/15">
          <span className="text-[10px] font-semibold text-copper uppercase tracking-widest">
            ● {context.mode === 'swarm_active' ? 'Swarm Active' :
               context.mode === 'approval_needed' ? 'Approval Needed' :
               context.mode === 'twin_insight' ? 'Digital Twin Insight' :
               'Onboarding'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Streaming Message ── */

function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] p-3.5 rounded-2xl bg-white text-foreground/80 border border-border rounded-tl-none shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={12} className="text-copper" />
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
            Aurelius
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <span className="inline-block w-1.5 h-4 bg-copper ml-0.5 animate-pulse align-text-bottom" />
      </div>
    </div>
  )
}

/* ── Error Banner ── */

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mx-1"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-red-400 hover:text-copper">✕</button>
    </motion.div>
  )
}

/* ── AureliusChat Component ── */

export function AureliusChat({ context }: AureliusChatProps) {
  const {
    history, addMessage, isThinking, setThinking,
    streamingContent, setStreamingContent, appendStreamingContent,
    error, setError, clearHistory
  } = useAureliusStore()
  const swarm = useSwarmStore()
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const brandFetchedRef = useRef(false)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 44, maxHeight: 120 })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch brand profile once on mount
  useEffect(() => {
    if (brandFetchedRef.current) return
    brandFetchedRef.current = true

    getUserProjectProfile().then(profile => {
      if (profile) setBrandProfile(profile)
    }).catch(() => {
      // Silently fail — brand profile is optional for the API
    })
  }, [])

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, streamingContent])

  // Send message to the API
  const sendMessage = useCallback(async (userMsg: AureliusMessage) => {
    // Build the conversation history for the API
    const apiMessages = [
      ...history,
      userMsg,
    ].map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    // Build current context for the system prompt
    const apiContext: Record<string, unknown> = {
      pathname: window.location.pathname,
      swarmStatus: swarm.status,
      confidenceScore: swarm.confidenceScore,
      activeAgent: swarm.activeAgent,
    }

    // Attach brand profile if available
    if (brandProfile) {
      apiContext.brand = brandProfile
    }

    // Cancel any previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsStreaming(true)
    setThinking(true)
    setStreamingContent('')
    setError(null)

    try {
      const response = await fetch('/api/aurelius/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: apiContext,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => null)
        throw new Error(errBody?.error || `Request failed (${response.status})`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream available')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        appendStreamingContent(chunk)
      }

      // Streaming complete — add the full message to history
      const finalContent = useAureliusStore.getState().streamingContent
      if (finalContent.trim()) {
        addMessage({ role: 'assistant', content: finalContent })
      }
      setStreamingContent('')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled — keep partial content if any
        const partialContent = useAureliusStore.getState().streamingContent
        if (partialContent.trim()) {
          addMessage({ role: 'assistant', content: partialContent })
        }
        setStreamingContent('')
        return
      }
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setThinking(false)
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [history, swarm.status, swarm.confidenceScore, swarm.activeAgent, brandProfile, addMessage, setThinking, setStreamingContent, appendStreamingContent, setError])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isThinking || isStreaming) return

    const userMsg: AureliusMessage = { role: 'user', content: input }
    addMessage(userMsg)
    setInput('')
    adjustHeight(true)

    await sendMessage(userMsg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasMessages = history.length > 1 || (history.length === 1 && history[0]?.role === 'user')
  const showStreaming = isStreaming && streamingContent.length > 0

  return (
    <div className="flex flex-col h-[480px]">
      {/* Brand Profile Indicator */}
      {brandProfile && !hasMessages && (
        <div className="mb-2 px-3 py-1.5 bg-copper/5 rounded-lg border border-copper/15 text-center">
          <span className="text-[10px] font-medium text-copper">
            ● {brandProfile.name} · {brandProfile.industry}
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-2">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-3 custom-scrollbar" ref={scrollRef}>
        {!hasMessages && !showStreaming ? (
          <EmptyState context={context} />
        ) : (
          <div className="space-y-4 px-1">
            <AnimatePresence initial={false}>
              {history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={cn(
                    "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? 'bg-copper text-white rounded-tr-none'
                      : 'bg-white text-foreground/80 border border-border rounded-tl-none'
                  )}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {msg.role === 'assistant' && (
                        <Sparkles size={12} className="text-copper" />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                        {msg.role === 'user' ? 'You' : 'Aurelius'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Streaming message */}
              {showStreaming && (
                <motion.div
                  key="streaming"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <StreamingMessage content={streamingContent} />
                </motion.div>
              )}

              {/* Thinking dots */}
              {isThinking && !showStreaming && <TypingDots />}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
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
              "text-foreground text-sm",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground",
              "min-h-[44px]"
            )}
            style={{ overflow: 'hidden' }}
            disabled={isStreaming}
          />
        </div>

        <div className="flex items-center justify-between p-2 border-t border-border">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-lg text-[10px] text-muted-foreground transition-colors border border-dashed border-gray-300 hover:border-gray-400 hover:bg-muted flex items-center gap-1"
            >
              <PlusIcon className="w-3 h-3" />
              Context
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {isStreaming && (
              <button
                type="button"
                onClick={() => {
                  abortRef.current?.abort()
                  setIsStreaming(false)
                  setThinking(false)
                }}
                className="px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                Stop
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isThinking || isStreaming}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center justify-center",
                input.trim() && !isStreaming
                  ? "bg-copper text-white hover:bg-copper/80 shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
