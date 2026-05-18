'use client'

import { motion } from 'framer-motion'

type AgentName = 'researcher' | 'psychologist' | 'strategist' | 'copywriter'

interface PricingPlan {
  id: 'fast_scan' | 'deep_simulation'
  name: string
  price_mo: number
  price_yr: number
  features: string[]
  swarm_mode: 'fast' | 'deep'
  agents: AgentName[]
}

const plans: PricingPlan[] = [
  {
    id: 'fast_scan',
    name: 'Fast Scan',
    price_mo: 29,
    price_yr: 19,
    swarm_mode: 'fast',
    agents: ['researcher', 'copywriter'],
    features: [
      '2 agenți activi (Researcher + Copywriter)',
      'Research superficial (Tavily)',
      'Fără Digital Twin Sandbox',
      '10 campanii / lună',
      'Export .txt',
      'Cloud Vault 1GB',
    ]
  },
  {
    id: 'deep_simulation',
    name: 'Deep Simulation',
    price_mo: 79,
    price_yr: 59,
    swarm_mode: 'deep',
    agents: ['researcher', 'psychologist', 'strategist', 'copywriter'],
    features: [
      'Full Swarm (4 agenți paraleli)',
      'Digital Twin + OCEAN Profiling',
      'Reaction Simulation Panel',
      'Human-in-the-Loop Approval',
      'Campanii nelimitate',
      'Export .docx + .txt',
      'Klaviyo Integration',
      'Cloud Vault 20GB + RAG',
      'Founder Mode (plan Enterprise)',
    ]
  }
]

export function PricingSection() {
  return (
    <section className="py-24 px-6 bg-obsidian relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-cream mb-4">Selectează Nivelul de Simulare</h2>
          <p className="text-cream/60">Alege între viteză și profunzime psihologică.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -10 }}
              className={`glass-card p-10 rounded-3xl relative overflow-hidden flex flex-col ${
                plan.id === 'deep_simulation' ? 'border-copper/50' : 'border-copper/10'
              }`}
            >
              {plan.id === 'deep_simulation' && (
                <div className="absolute top-0 right-0 bg-copper text-obsidian px-6 py-1 text-xs tracking-widest uppercase">
                  RECOMANDAT
                </div>
              )}
              
              <h3 className="text-2xl font-serif text-cream mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-light text-copper">${plan.price_mo}</span>
                <span className="text-cream/40 text-sm">/ lună</span>
              </div>

              <ul className="space-y-4 mb-10 grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-cream/70 text-sm">
                    <span className="text-copper mt-1">✦</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-full tracking-widest text-sm transition-all duration-300 ${
                plan.id === 'deep_simulation' 
                  ? 'bg-copper text-obsidian hover:bg-copper-light' 
                  : 'border border-copper/30 text-copper hover:bg-copper/10'
              }`}>
                ALEGE ACEST PLAN
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
