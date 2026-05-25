'use client'

import { NotFoundPage } from '@/components/ui/NotFoundPage'
import { useEffect } from 'react'

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <NotFoundPage
      isError
      errorMessage={error.message}
      onRetry={reset}
    />
  )
}
