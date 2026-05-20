'use client'

import { AuthUI } from '@/components/ui/auth-fuse'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

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
        toast.error(res.error.message || 'Registration failed')
      } else {
        toast.success('Account created successfully!')
        router.push(`/${locale}/onboarding`)
      }
    } catch (err) {
      console.error('Sign up unexpected error:', err)
      toast.error('An unexpected error occurred')
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
      toast.error('Google sign in failed')
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
            quote: { text: 'Welcome Back! The journey continues.', author: 'MailMind' },
          }}
          signUpContent={{
            quote: { text: 'Create an account. A new chapter awaits.', author: 'MailMind' },
          }}
        />
      </main>
    </div>
  )
}
