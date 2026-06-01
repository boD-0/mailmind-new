'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { useTranslation } from '@/components/I18nProvider'

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

function getPasswordStrength(pw: string): { checks: { minLength: boolean; hasUppercase: boolean; hasLowercase: boolean; hasNumber: boolean; hasSpecial: boolean }; score: number; level: StrengthLevel } {
  const checks = {
    minLength: pw.length >= 8,
    hasUppercase: /[A-Z]/.test(pw),
    hasLowercase: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
  }
  const score = Object.values(checks).filter(Boolean).length
  const level: StrengthLevel = score <= 2 ? 'weak' : score <= 3 ? 'fair' : score <= 4 ? 'good' : 'strong'
  return { checks, score, level }
}

function StrengthIndicator({ level, score }: { level: StrengthLevel; score: number }) {
  const colorMap: Record<StrengthLevel, string> = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-emerald-500',
  }
  const labelMap: Record<StrengthLevel, string> = {
    weak: 'auth.strength_weak',
    fair: 'auth.strength_fair',
    good: 'auth.strength_good',
    strong: 'auth.strength_strong',
  }
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{t(labelMap[level])}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= score ? colorMap[level] : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) || 'ro'
  const { t } = useTranslation()

  const token = searchParams.get('token')
  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t('auth.toast_reset_mismatch'))
      return
    }

    if (password.length < 8) {
      toast.error(t('auth.toast_reset_too_short'))
      return
    }

    if (!token) {
      toast.error(t('auth.toast_reset_no_token'))
      return
    }

    setLoading(true)
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (error) {
        toast.error(error.message || t('auth.toast_reset_error'))
      } else {
        toast.success(t('auth.toast_reset_success'))
        setDone(true)
      }
    } catch {
      toast.error(t('auth.toast_reset_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('auth.reset_title')}</h1>
          {!done && (
            <p className="text-sm text-muted-foreground">{t('auth.reset_desc')}</p>
          )}
        </div>

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t('auth.toast_reset_no_token')}</p>
            <button
              onClick={() => router.push(`/${locale}/forgot-password`)}
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('auth.forgot_submit')}
            </button>
          </div>
        ) : done ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{t('auth.reset_done')}</p>
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
              <label htmlFor="password" className="text-sm font-medium">{t('auth.password_label')}</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {password.length > 0 && (
                <div className="space-y-2">
                  <StrengthIndicator level={strength.level} score={strength.score} />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {([
                      ['minLength', 'auth.strength_min_length'],
                      ['hasUppercase', 'auth.strength_uppercase'],
                      ['hasLowercase', 'auth.strength_lowercase'],
                      ['hasNumber', 'auth.strength_number'],
                      ['hasSpecial', 'auth.strength_special'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <svg
                          className={`h-3 w-3 shrink-0 transition-colors ${strength.checks[key] ? 'text-emerald-500' : 'text-muted-foreground/50'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          {strength.checks[key] ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          )}
                        </svg>
                        <span className={`text-xs ${strength.checks[key] ? 'text-foreground' : 'text-muted-foreground'}`}>{t(label)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">{t('auth.reset_confirm_label')}</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                placeholder={t('auth.reset_confirm_placeholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-foreground text-background h-10 px-4 py-2 w-full hover:bg-foreground/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />}
              {t('auth.reset_submit')}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
