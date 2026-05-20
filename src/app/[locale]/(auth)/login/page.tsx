'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from '@/components/I18nProvider'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const { t } = useTranslation()

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      })

      if (error) {
        toast.error(error.message || t('auth.toast_signin_error'))
      } else {
        toast.success(t('auth.toast_signin_success'))
        router.push(`/${locale}/dashboard`)
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
        callbackURL: `/${locale}/dashboard`,
      })
    } catch {
      toast.error(t('auth.toast_google_error'))
    }
  }

  return (
    <div className="dashboard-light">
      <main className="bg-background text-foreground min-h-screen">
        <AuthUI
          onSignIn={handleSignIn}
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
