'use client'

import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/components/I18nProvider'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const error = searchParams.get('error')
    const token = searchParams.get('token')

    if (error) {
      setStatus('error')
      if (error === 'invalid_token') {
        setErrorMessage(t('auth.verify_error_invalid'))
      } else if (error === 'expired_token') {
        setErrorMessage(t('auth.verify_error_expired'))
      } else {
        setErrorMessage(t('auth.verify_error_generic'))
      }
    } else if (token) {
      // Has a token and no error — verification succeeded
      setStatus('success')
    } else {
      // No token and no error — invalid link
      setStatus('error')
      setErrorMessage(t('auth.verify_error_generic'))
    }
  }, [searchParams, t])

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted-foreground border-t-transparent mx-auto" />
            <p className="text-muted-foreground">{t('auth.verify_loading')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{t('auth.verify_success_title')}</h1>
              <p className="text-muted-foreground">{t('auth.verify_success_desc')}</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('auth.verify_go_dashboard')}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{t('auth.verify_error_title')}</h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t('auth.sign_in_link')}
              </button>
              <button
                onClick={() => router.push(`/${locale}/sign-up`)}
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                {t('auth.sign_up_link')}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
