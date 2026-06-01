'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useTranslation } from '@/components/I18nProvider'

export default function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `/${locale}/reset-password`,
      })
      if (error) {
        toast.error(error.message || t('auth.toast_forgot_error'))
      } else {
        toast.success(t('auth.toast_forgot_success'))
        setSent(true)
      }
    } catch {
      toast.error(t('auth.toast_forgot_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('auth.forgot_title')}</h1>
          {!sent && (
            <p className="text-sm text-muted-foreground">{t('auth.forgot_desc')}</p>
          )}
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{t('auth.forgot_sent')}</p>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('auth.sign_in_link')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">{t('auth.email_label')}</label>
              <input
                id="email"
                type="email"
                required
                placeholder={t('auth.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-foreground text-background h-10 px-4 py-2 w-full hover:bg-foreground/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />}
              {t('auth.forgot_submit')}
            </button>
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.has_account')}{' '}
              <button
                type="button"
                onClick={() => router.push(`/${locale}/login`)}
                className="font-medium text-foreground hover:underline"
              >
                {t('auth.sign_in_link')}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
