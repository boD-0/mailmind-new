'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from '@/components/I18nProvider'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const { t } = useTranslation()

  const handleSignUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: `/${locale}/onboarding`,
      })

      if (res.error) {
        toast.error(res.error.message || t('auth.toast_signup_error'))
      } else {
        toast.success(t('auth.toast_signup_success'))
        router.push(`/${locale}/onboarding`)
      }
    } catch (err) {
      console.error('Sign up unexpected error:', err)
      toast.error(t('auth.toast_unexpected'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `/${locale}/onboarding`,
      })
    } catch {
      toast.error(t('auth.toast_google_error'))
    }
  }

  return (
    <div className="dashboard-light">
      <main className="bg-background text-foreground min-h-screen">
        <AuthUI
          isSignIn={false}
          onSignUp={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          loading={loading}
          signInContent={{
            quote: { text: t('auth.quote_sign_in'), author: t('auth.author') },
          }}
          signUpContent={{
            quote: { text: t('auth.quote_sign_up'), author: t('auth.author') },
          }}
        />
      </main>
    </div>
  )
}
