'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, Brain, Target, PenTool, Sparkles, ArrowRight, Check,
  Play, RefreshCw, Mail, User, Building2, Clock,
} from 'lucide-react'
import { useTranslation } from '@/components/I18nProvider'

/* ── DATA ── */

const agents = [
  {
    id: 'researcher',
    icon: Search,
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    nameKey: 'demo.agent_researcher',
    actionKey: 'demo.action_research',
    doneKey: 'demo.done_research',
  },
  {
    id: 'psychologist',
    icon: Brain,
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    nameKey: 'demo.agent_psychologist',
    actionKey: 'demo.action_profile',
    doneKey: 'demo.done_profile',
  },
  {
    id: 'strategist',
    icon: Target,
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600',
    nameKey: 'demo.agent_strategist',
    actionKey: 'demo.action_strategy',
    doneKey: 'demo.done_strategy',
  },
  {
    id: 'copywriter',
    icon: PenTool,
    color: 'rose',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600',
    nameKey: 'demo.agent_copywriter',
    actionKey: 'demo.action_write',
    doneKey: 'demo.done_write',
  },
]

const sampleProspects = [
  { name: 'Sarah Chen', company: 'Arcadia Finance', role: 'VP of Growth', location: 'SF Bay Area' },
  { name: 'Marcus Webb', company: 'NorthStack', role: 'CTO', location: 'Austin, TX' },
  { name: 'Priya Patel', company: 'Helix Capital', role: 'Principal', location: 'New York' },
]

const completedEmail = `Subject: Your approach to growth at Arcadia

Hi Sarah,

I noticed you recently shared that thread about PLG motions in fintech — the point about trust being the bottleneck really resonated.

Most emails treat you like a job title. But looking at your background — from operator at Stripe to leading growth at Arcadia — you clearly value substance over fluff.

Here's the thing: personalization at scale is broken. Templates don't work because they're written for a role, not a person.

That's why we built MailMind — four specialized AI agents that research, profile, strategize, and write emails calibrated specifically for you. Not a template. A message.

Would you be open to a 5-min chat about what you're seeing in fintech growth right now?

Best,
[Your name]`

const steps = [
  { id: 'input', labelKey: 'demo.step_enter' },
  { id: 'process', labelKey: 'demo.step_process' },
  { id: 'result', labelKey: 'demo.step_ready' },
]

/* ── COMPONENT ── */

export default function DemoPage() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const [step, setStep] = useState(0)
  const [selectedProspect, setSelectedProspect] = useState<typeof sampleProspects[number] | null>(null)
  const [customName, setCustomName] = useState('')
  const [customCompany, setCustomCompany] = useState('')
  const [activeAgent, setActiveAgent] = useState(-1)
  const [showEmail, setShowEmail] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const prospect = selectedProspect || (customName.trim() ? { name: customName, company: customCompany || 'your company', role: 'Prospect', location: '' } : null)

  // Reset when going back
  useEffect(() => {
    if (step !== 1) {
      setActiveAgent(-1)
      setIsRunning(false)
    }
    if (step !== 2) {
      setShowEmail(false)
    }
  }, [step])

  function runDemo() {
    if (!prospect) return
    setStep(1)
    setIsRunning(true)
    setActiveAgent(-1)

    agents.forEach((_, i) => {
      setTimeout(() => {
        setActiveAgent(i)
        if (i === agents.length - 1) {
          setTimeout(() => {
            setStep(2)
            setTimeout(() => setShowEmail(true), 500)
          }, 1500)
        }
      }, i * 2000)
    })
  }

  function resetDemo() {
    setStep(0)
    setSelectedProspect(null)
    setCustomName('')
    setCustomCompany('')
    setActiveAgent(-1)
    setShowEmail(false)
    setIsRunning(false)
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] font-sans antialiased">
      {/* ── Simple Header ── */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <motion.div
              className="w-8 h-8 bg-[#ff5f5f] rounded-xl flex items-center justify-center shadow-sm"
              whileHover={{ rotate: -10, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <span className="text-white text-xs font-extrabold tracking-tight">M</span>
            </motion.div>
            <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">MailMind</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#ff5f5f] bg-[#ff5f5f]/10 px-3 py-1.5 rounded-full">
              {t('demo.header')}
            </span>
            <Link
              href={`/${locale}/sign-up`}
              className="hidden sm:inline-flex bg-[#ff5f5f] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition-all"
            >
              {t('nav.try_free')}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${
                i <= step ? 'text-[#ff5f5f]' : 'text-gray-300'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-[#ff5f5f] text-white'
                    : i === step
                    ? 'bg-[#ff5f5f]/10 text-[#ff5f5f] border border-[#ff5f5f]/30'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-semibold tracking-wide hidden sm:inline ${
                  i === step ? 'text-[#1a1a1a]' : 'text-gray-400'
                }`}>
                  {t(s.labelKey)}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${
                  i < step ? 'bg-[#ff5f5f]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Input ── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                >
                  {t('demo.title_1')}{' '}
                  <span className="bg-gradient-to-r from-[#ff5f5f] to-purple-500 bg-clip-text text-transparent">
                    {t('demo.title_highlight')}
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-500 text-sm max-w-md mx-auto"
                >
                  {t('demo.subtitle')}
                </motion.p>
              </div>

              {/* Quick pick prospects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 text-center">
                  {t('demo.sample_prospects')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sampleProspects.map((p, i) => (
                    <motion.button
                      key={p.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      onClick={() => {
                        setSelectedProspect(p)
                        setCustomName('')
                        setCustomCompany('')
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedProspect?.name === p.name
                          ? 'border-[#ff5f5f] bg-[#ff5f5f]/5 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-emerald-100 text-emerald-600' :
                          i === 1 ? 'bg-amber-100 text-amber-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">{p.company}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{t('demo.or_custom')}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Custom input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('demo.placeholder_name')}
                      value={customName}
                      onChange={e => { setCustomName(e.target.value); setSelectedProspect(null) }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#ff5f5f] focus:ring-1 focus:ring-[#ff5f5f]/20 transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('demo.placeholder_company')}
                      value={customCompany}
                      onChange={e => setCustomCompany(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#ff5f5f] focus:ring-1 focus:ring-[#ff5f5f]/20 transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Launch button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <motion.button
                  onClick={runDemo}
                  disabled={!prospect}
                  whileHover={prospect ? { scale: 1.02 } : {}}
                  whileTap={prospect ? { scale: 0.98 } : {}}
                  className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold transition-all ${
                    prospect
                      ? 'bg-[#ff5f5f] text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-200/50'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Play size={16} />
                  {t('demo.launch')}
                </motion.button>
                {prospect && (
                  <p className="text-xs text-gray-400 mt-3">
                    {t('demo.demo_for')} <span className="font-semibold text-gray-600">{prospect.name}</span>
                    {prospect.company && <span className="text-gray-400"> · {prospect.company}</span>}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 1: Agents at work ── */}
          {step === 1 && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Live status bar */}
              <div className="flex items-center justify-center gap-2">
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                  {activeAgent < agents.length - 1
                    ? t('demo.working_on', { agent: t(agents[activeAgent >= 0 ? activeAgent : 0]!.nameKey) })
                    : t('demo.finalizing_text')}
                </span>
              </div>

              {/* Prospect info */}
              {prospect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-[#ff5f5f]/10 flex items-center justify-center">
                      <User size={12} className="text-[#ff5f5f]" />
                    </div>
                    <span className="text-sm font-semibold">{prospect.name}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">{prospect.company}</span>
                  </div>
                </motion.div>
              )}

              {/* Agent pipeline */}
              <div className="space-y-3 max-w-lg mx-auto">
                {agents.map((agent, i) => {
                  const isActive = activeAgent >= i
                  const isCurrent = activeAgent === i
                  const isDone = activeAgent > i
                  const Icon = agent.icon

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isActive ? 1 : 0.3,
                        x: 0,
                        scale: isCurrent ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isDone
                          ? `${agent.bg} ${agent.border}`
                          : isCurrent
                          ? 'bg-white border-[#ff5f5f]/30 shadow-md'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      {/* Icon */}
                      <motion.div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isDone
                            ? agent.iconBg
                            : isCurrent
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gray-50 text-gray-300'
                        }`}
                        animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                      >
                        <Icon size={18} />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${
                            isDone ? 'text-[#1a1a1a]' : isCurrent ? 'text-[#1a1a1a]' : 'text-gray-300'
                          }`}>
                            {t(agent.nameKey)}
                          </span>
                          {isDone && (
                            <span className="text-emerald-500">
                              <Check size={14} />
                            </span>
                          )}
                          {isCurrent && (
                            <motion.span
                              className="w-1.5 h-1.5 rounded-full bg-[#ff5f5f]"
                              animate={{ opacity: [1, 0.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${
                          isDone ? 'text-gray-500' : isCurrent ? 'text-gray-400' : 'text-gray-200'
                        }`}>
                          {isDone ? t(agent.doneKey) : isCurrent ? t(agent.actionKey) : t('demo.waiting')}
                        </p>
                      </div>

                      {/* Progress bar */}
                      {isCurrent && (
                        <motion.div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#ff5f5f] rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Processing message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-xs text-gray-400 italic"
              >
                {activeAgent < agents.length - 1
                  ? t('demo.collaborating')
                  : t('demo.finalizing')}
              </motion.p>
            </motion.div>
          )}

          {/* ── STEP 2: Result ── */}
          {step === 2 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Success banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-center space-y-3"
              >
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                  <Sparkles size={12} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">{t('demo.email_ready')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {t('demo.result_title_1')}{' '}
                  <span className="text-emerald-500">{t('demo.result_title_highlight')}</span>
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {t('demo.result_desc', { name: prospect?.name || '' })}
                </p>
              </motion.div>

              {/* Agent recap */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 flex-wrap"
              >
                {agents.map((agent, i) => {
                  const Icon = agent.icon
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex items-center gap-1.5 ${agent.bg} border ${agent.border} rounded-full px-3 py-1`}
                    >
                      <Icon size={10} className={agent.iconBg.split(' ').pop()!} />
                      <span className="text-[10px] font-semibold text-gray-600">{t(agent.nameKey)}</span>
                      <Check size={10} className="text-emerald-500" />
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Email preview */}
              <AnimatePresence>
                {showEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    {/* Email header */}
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#ff5f5f]/10 flex items-center justify-center">
                        <Mail size={14} className="text-[#ff5f5f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{t('demo.to', { name: prospect?.name || '' })}</p>
                        <p className="text-xs text-gray-400 truncate">{prospect?.company}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        <span>{t('demo.just_now')}</span>
                      </div>
                    </div>

                    {/* Email body */}
                    <div className="p-5 md:p-6 text-sm leading-relaxed whitespace-pre-line text-gray-700 font-[system-ui]">
                      {completedEmail}
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Sparkles size={12} className="text-[#ff5f5f]" />
                        <span>{t('demo.written_by')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetDemo}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a1a1a] bg-white border border-gray-200 px-3 py-1.5 rounded-full transition-all"
                        >
                          <RefreshCw size={12} />
                          {t('demo.try_again')}
                        </motion.button>
                        <Link
                          href={`/${locale}/sign-up`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#ff5f5f] px-3 py-1.5 rounded-full hover:bg-red-500 transition-all"
                        >
                          {t('demo.try_mailmind')}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 max-w-sm mx-auto"
              >
                {[
                  { value: '12s', labelKey: 'demo.stat_time' },
                  { value: '4', labelKey: 'demo.stat_agents' },
                  { value: '93%', labelKey: 'demo.stat_confidence' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.labelKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="text-center p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <p className="text-lg font-extrabold text-[#ff5f5f]">{stat.value}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t(stat.labelKey)}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        {step > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 pt-8 border-t border-gray-200 text-center"
          >
            <p className="text-sm text-gray-500 mb-3">
              {t('demo.bottom_text')}
            </p>
            <Link
              href={`/${locale}/sign-up`}
              className="inline-flex items-center gap-2 bg-[#ff5f5f] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-red-500 transition-all hover:shadow-lg hover:shadow-red-200/50"
            >
              {t('demo.bottom_cta')}
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}
