'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      })

      if (error) {
        toast.error(error.message || 'Authentication failed')
      } else {
        toast.success('Signed in successfully!')
        router.push(`/${locale}/dashboard`)
      }
    } catch {
      toast.error('An unexpected error occurred')
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
      toast.error('Google sign in failed')
    }
  }

  return (
    <main className="bg-background text-foreground">
      <AuthUI
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        loading={loading}
        signInContent={{
          quote: { text: 'Welcome Back! The journey continues.', author: 'MailMind' },
        }}
        signUpContent={{
          quote: { text: 'Create an account. A new chapter awaits.', author: 'MailMind' },
        }}
      />
    </main>
  )
}
