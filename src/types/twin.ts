export interface DigitalTwin {
  ocean: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  custom_signals: {
    communication_tone: 'formal' | 'casual' | 'technical' | 'visionary'
    decision_speed: 'fast' | 'deliberate' | 'committee-based'
    pain_point_category: 'growth' | 'efficiency' | 'risk' | 'prestige'
    linkedin_activity: 'high' | 'medium' | 'low' | 'absent'
    industry_maturity: 'startup' | 'scaleup' | 'enterprise'
    role_tenure_months: number
  }
  reaction_map: {
    curiosity: number
    interest: number
    irritability: number
    trust: number
    urgency_felt: number
  }
  generated_at: string
  confidence: number
  sources_used: string[]
}

export interface TwinState {
  profile: DigitalTwin | null
  isGenerating: boolean
}

export interface TwinActions {
  setProfile: (profile: DigitalTwin | null) => void
  setIsGenerating: (isGenerating: boolean) => void
}
