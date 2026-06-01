export interface AureliusContext {
  hint: string
  mode: 'swarm_active' | 'approval_needed' | 'twin_insight' | 'onboarding' | 'idle'
}

export interface AureliusParams {
  swarm: {
    status: 'running' | 'awaiting_approval' | 'idle' | 'success' | 'error'
    confidenceScore: number
    activeAgent?: string
  }
  twin: {
    profile?: {
      ocean: {
        openness: number
      }
    }
  }
  pathname: string
}

export function buildContext({ swarm, twin, pathname }: AureliusParams): AureliusContext {
  if (pathname.includes('war-room')) {
    if (swarm.status === 'running') return {
      hint: `Swarm-ul rulează. Confidence: ${swarm.confidenceScore}%. Agentul activ acum: ${swarm.activeAgent}.`,
      mode: 'swarm_active'
    }
    if (swarm.status === 'awaiting_approval') return {
      hint: 'Swarm-ul a finalizat research-ul și strategia. Revizuiește datele și apasă Approve pentru a porni Copywriter-ul.',
      mode: 'approval_needed'
    }
    if (twin.profile) return {
      hint: `Prospectul tău are un scor de Openness ${twin.profile.ocean.openness}/100. Asta înseamnă că va răspunde bine la idei inovatoare, nu la mesaje conservative.`,
      mode: 'twin_insight'
    }
  }
  
  if (pathname === '/onboarding') return {
    hint: 'Valorile brandului pe care le introduci acum vor ghida comportamentul întregului Swarm în toate campaniile viitoare.',
    mode: 'onboarding'
  }
  
  return { 
    hint: 'Bună ziua. Sunt Aurelius. Cum pot optimiza sesiunea ta?', 
    mode: 'idle' 
  }
}
