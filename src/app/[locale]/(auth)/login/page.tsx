'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from '@/components/I18nProvider'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) || 'en'
  const { t } = useTranslation()

  // If the user was redirected from a protected page, send them back there.
  // Only allow relative paths to prevent open redirect attacks
  // (including protocol-relative URLs like //evil.com).
  const rawRedirect = searchParams.get('redirect')
  const redirectPath = (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : `/${locale}/dashboard`

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirectPath,
      })

      if (error) {
        toast.error(error.message || t('auth.toast_signin_error'))
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
        loading={loading}
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
