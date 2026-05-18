'use client'

import dynamic from 'next/dynamic'

// Dynamic imports for Recharts
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });

const demoData = [
  { subject: 'Openness', A: 85 },
  { subject: 'Conscientiousness', A: 70 },
  { subject: 'Extraversion', A: 60 },
  { subject: 'Agreeableness', A: 50 },
  { subject: 'Neuroticism', A: 30 },
]

export function TwinDemoSection() {
  return (
    <section className="py-24 px-6 bg-obsidian relative min-w-0">
      <div className="container mx-auto max-w-6xl min-w-0">
        <div className="grid md:grid-cols-2 gap-16 items-center min-w-0">
          <div className="order-2 md:order-1 h-[450px] glass-card rounded-3xl p-6 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demoData}>
                <PolarGrid stroke="rgba(193, 123, 63, 0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(248, 247, 244, 0.6)', fontSize: 12 }} />
                <Radar
                  name="Prospect"
                  dataKey="A"
                  stroke="var(--copper)"
                  fill="var(--copper)"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-serif text-cream mb-6">Digital Twin Synthesis</h2>
            <p className="text-cream/70 text-lg leading-relaxed mb-8">
              Fiecare prospect este unic. Sistemul nostru generează un profil psihologic bazat pe modelul 
              <span className="text-copper"> OCEAN</span>, permițând agenților să-și adapteze tonul, 
              argumentele și frecvența comunicării.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 glass-card rounded-xl">
                <div className="text-copper text-xl font-serif mb-1">85%</div>
                <div className="text-cream/40 text-xs tracking-widest uppercase">Acuratețe Profil</div>
              </div>
              <div className="p-4 glass-card rounded-xl">
                <div className="text-copper text-xl font-serif mb-1">Simulare</div>
                <div className="text-cream/40 text-xs tracking-widest uppercase">Sandbox Live</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
