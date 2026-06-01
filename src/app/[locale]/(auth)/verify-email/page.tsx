'use client'

import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted-foreground border-t-transparent mx-auto" />
        </div>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
