'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useTranslation } from '@/components/I18nProvider'
import { AuthPageShell } from '@/components/ui/AuthPageShell'
import { EmptyState } from '@/components/ui/empty-state'
import { ShieldAlert } from 'lucide-react'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token')
  const error = searchParams.get('error')

  useEffect(() => {
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
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(t('auth.verify_error_generic'))
    }
  }, [error, token, t])

  const handleResend = async () => {
    if (!email) {
      toast.error(t('auth.verify_resend_missing_email'))
      return
    }
    setResending(true)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `/${locale}/verify-email`,
      })
      if (error) {
        toast.error(error.message || t('auth.toast_resend_error'))
      } else {
        setResent(true)
        toast.success(t('auth.toast_resend_success'))
      }
    } catch {
      toast.error(t('auth.toast_resend_error'))
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthPageShell title={status === 'success' ? t('auth.verify_success_title') : t('auth.verify_error_title')} showPreview={false}>
      <div className="space-y-6 text-center">
        {status !== 'error' && (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {status === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </div>
        )}

        {status === 'loading' ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted-foreground border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">{t('auth.verify_loading')}</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {email ? (
                <>We sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Click it to activate your account.</>
              ) : (
                t('auth.verify_success_desc')
              )}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t('auth.verify_go_dashboard')}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resent}
                className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-amber-700 px-6 py-3 text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resent ? t('auth.verify_resend_sent') : t('auth.verify_resend')}
              </button>
            </div>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {t('auth.verify_wrong_email')}
            </button>
          </div>
        ) : (
          <EmptyState
            icon={<ShieldAlert size={48} />}
            message={errorMessage}
            ctaLabel={t('auth.sign_in_link')}
            ctaHref={`/${locale}/login`}
            secondaryLabel={t('auth.sign_up_link')}
            secondaryHref={`/${locale}/sign-up`}
            className="py-8"
          />
        )}
      </div>
    </AuthPageShell>
  )
}
