'use client'

import { NotFoundPage } from '@/components/ui/NotFoundPage'
import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <NotFoundPage
      isError
      errorMessage={error.message}
      onRetry={unstable_retry}
    />
  )
}
