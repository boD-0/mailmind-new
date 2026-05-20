import { CountdownBanner } from '@/components/ui/the-future-arrives-soon-cta'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Under Maintenance — MailMind',
  description: 'We\'ll be back very soon. Scheduled upgrades in progress.',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="min-h-screen">
      <CountdownBanner />
    </main>
  )
}
