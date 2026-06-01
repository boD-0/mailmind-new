'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useTranslation } from '@/components/I18nProvider'

export default function LoginPageContent() {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [lastEmail, setLastEmail] = useState('')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  // If the user was redirected from a protected page, send them back there.
  // Only allow relative paths to prevent open redirect attacks
  // (including protocol-relative URLs like //evil.com).
  const rawRedirect = searchParams.get('redirect')
  const redirectPath = (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : `/${locale}/dashboard`

  const handleResendVerification = useCallback(async () => {
    if (!lastEmail) return
    setResending(true)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: lastEmail,
        callbackURL: `/${locale}/verify-email`,
      })
      if (error) {
        toast.error(error.message || t('auth.toast_resend_error'))
      } else {
        toast.success(t('auth.toast_resend_success'))
        setShowResend(false)
      }
    } catch {
      toast.error(t('auth.toast_resend_error'))
    } finally {
      setResending(false)
    }
  }, [lastEmail, locale, t])

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true)
    setLastEmail(email)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirectPath,
      })

      if (error) {
        const msg = error.message?.toLowerCase() || ''
        if (msg.includes('not verified')) {
          toast.error(t('auth.toast_email_not_verified'))
          setShowResend(true)
        } else {
          toast.error(error.message || t('auth.toast_signin_error'))
        }
      } else {
        toast.success(t('auth.toast_signin_success'))
        router.push(redirectPath)
      }
    } catch {
      toast.error(t('auth.toast_unexpected'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectPath,
      })
    } catch {
      toast.error(t('auth.toast_google_error'))
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <AuthUI
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={() => router.push(`/${locale}/forgot-password`)}
        loading={loading}
        signInContent={{
          quote: { text: t('auth.quote_sign_in'), author: t('auth.author') },
        }}
        signUpContent={{
          quote: { text: t('auth.quote_sign_up'), author: t('auth.author') },
        }}
      />
      {showResend && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-muted-foreground text-center sm:text-left flex-1">
              {t('auth.resend_prompt')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="text-sm font-medium text-foreground hover:underline disabled:opacity-50 whitespace-nowrap"
              >
                {resending ? t('auth.resend_sending') : t('auth.resend_button')}
              </button>
              <button
                onClick={() => setShowResend(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
