'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from '@/components/I18nProvider'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | undefined>(undefined)
  const router = useRouter()
  const params = useParams()
  const posthog = usePostHog()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const handleSignUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setLoading(true)
    setAuthError(undefined)
    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: `/${locale}/onboarding`,
      })

      if (res.error) {
        const errorMessage = res.error.message || t('auth.toast_signup_error')
        toast.error(errorMessage)
        setAuthError(errorMessage)
      } else {
        setAuthError(undefined)
        posthog.capture('signup_completed', { method: 'email' })
        posthog.capture('trial_started', { plan: 'PROFESSIONAL', source: 'signup' })
        toast.success(t('auth.toast_verify_email_sent'))
        router.push(`/${locale}/login`)
      }
    } catch (err) {
      console.error('Sign up unexpected error:', err)
      const errorMessage = t('auth.toast_unexpected')
      toast.error(errorMessage)
      setAuthError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      posthog.capture('signup_social_clicked', { provider: 'google' })
      posthog.capture('trial_started', { plan: 'PROFESSIONAL', source: 'google_signup' })
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `/${locale}/onboarding`,
      })
    } catch {
      toast.error(t('auth.toast_google_error'))
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <AuthUI
        isSignIn={false}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading}
        authError={authError}
        signInContent={{
          quote: { text: t('auth.quote_sign_in'), author: t('auth.author') },
        }}
        signUpContent={{
          quote: { text: t('auth.quote_sign_up'), author: t('auth.author') },
        }}
      />
    </main>
  )
}
