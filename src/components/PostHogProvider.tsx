'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    if (typeof window !== 'undefined' && token && !posthog.persistence?.get_property('$distinct_id')) {
      posthog.init(token, {
        api_host: "/ingest",
        ui_host: 'https://app.posthog.com',
        capture_pageview: false, // We do this manually in PostHogPageView
        capture_pageleave: true,
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
