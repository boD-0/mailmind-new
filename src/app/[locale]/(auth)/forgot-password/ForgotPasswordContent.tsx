'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useTranslation } from '@/components/I18nProvider'
import { AuthPageShell } from '@/components/ui/AuthPageShell'

export default function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [authError, setAuthError] = useState<string | undefined>(undefined)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(undefined)
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `/${locale}/reset-password`,
      })
      if (error) {
        const message = error.message || t('auth.toast_forgot_error')
        setAuthError(message)
        toast.error(message)
      } else {
        toast.success(t('auth.toast_forgot_success'))
        setSent(true)
      }
    } catch {
      const message = t('auth.toast_forgot_error')
      setAuthError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell title={t('auth.forgot_title')} description={t('auth.forgot_desc')}>
      {sent ? (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {authError ? (
            <div className="rounded-2xl border-l-4 border-destructive/80 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {authError}
            </div>
          ) : null}
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">{t('auth.email_label')}</label>
            <input
              id="email"
              type="email"
              required
              placeholder={t('auth.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground shadow-sm shadow-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-amber-400 text-sm font-semibold text-white h-12 px-4 hover:bg-amber-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : t('auth.forgot_submit')}
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
    </AuthPageShell>
  )
}
