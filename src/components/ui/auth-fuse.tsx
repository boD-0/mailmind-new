'use client'

import * as React from 'react'
import { useState, useId, useEffect } from 'react'
import { Slot } from '@radix-ui/react-slot'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff, Loader2, Search, Brain, Target, PenTool, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/components/I18nProvider'

/* ── Typewriter Effect ── */

export interface TypewriterProps {
  text: string | string[]
  speed?: number
  cursor?: string
  loop?: boolean
  deleteSpeed?: number
  delay?: number
  className?: string
}

export function Typewriter({
  text,
  speed = 100,
  cursor = '|',
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [textArrayIndex, setTextArrayIndex] = useState(0)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[textArrayIndex] || ''

  useEffect(() => {
    if (!currentText) return

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex])
            setCurrentIndex((prev) => prev + 1)
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentIndex(0)
            setTextArrayIndex((prev) => (prev + 1) % textArray.length)
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    )

    return () => clearTimeout(timeout)
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse opacity-60">{cursor}</span>
    </span>
  )
}

/* ── Label ── */

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

/* ── Button ── */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-sm active:shadow-none',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

/* ── Input ── */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

/* ── Password Input ── */

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId()
    const [showPassword, setShowPassword] = useState(false)
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            className={cn('pe-10', className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

function getPasswordStrength(password: string) {
  if (password.length >= 12) return { label: 'Strong', percent: 100, color: 'bg-emerald-500' }
  if (password.length >= 9) return { label: 'Good', percent: 70, color: 'bg-amber-400' }
  if (password.length >= 6) return { label: 'Weak', percent: 40, color: 'bg-destructive' }
  if (password.length > 0) return { label: 'Too short', percent: 20, color: 'bg-destructive' }
  return { label: '', percent: 0, color: 'bg-muted-foreground/20' }
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { label, percent, color } = getPasswordStrength(password)
  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      {label ? <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p> : null}
    </div>
  )
}

function ErrorBanner({ message, onDismiss }: { message?: string; onDismiss?: () => void }) {
  if (!message) return null
  return (
    <div className="relative flex items-start gap-3 rounded-lg border-l-[3px] border-[#E24B4A] bg-[#FCEBEB] px-4 py-3 text-sm text-[#A32D2D]" role="alert">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#A32D2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="flex-1 text-sm leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-[#A32D2D]/60 hover:text-[#A32D2D] transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ── SignIn Form ── */

interface SignInFormProps {
  onSignIn?: (data: { email: string; password: string }) => Promise<void> | void
  onForgotPassword?: () => void
  loading?: boolean
}

function SignInForm({ onSignIn, onForgotPassword, loading }: SignInFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSignIn?.({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t('auth.sign_in_title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">{t('auth.sign_in_desc')}</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t('auth.email_label')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('auth.email_placeholder')}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <PasswordInput
            name="password"
            label={t('auth.password_label')}
            required
            autoComplete="current-password"
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.forgot_password')}
            </button>
          </div>
        </div>
        <Button type="submit" className="mt-2 w-full" loading={loading}>
          {t('auth.sign_in_button')}
        </Button>
      </div>
    </form>
  )
}

/* ── SignUp Form ── */

interface SignUpFormProps {
  onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void> | void
  loading?: boolean
}

function SignUpForm({ onSignUp, loading }: SignUpFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSignUp?.({ name, email, password })
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t('auth.sign_up_title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">{t('auth.sign_up_desc')}</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">{t('auth.name_label')}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t('auth.name_placeholder')}
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email-signup">{t('auth.email_label')}</Label>
          <Input
            id="email-signup"
            name="email"
            type="email"
            placeholder={t('auth.email_placeholder')}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <PasswordInput
            name="password"
            label={t('auth.password_label')}
            required
            autoComplete="new-password"
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthBar password={password} />
        </div>
        <Button type="submit" className="mt-2 w-full" loading={loading}>
          {t('auth.sign_up_button')}
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          By continuing you agree to our <a href="#" className="text-primary underline hover:text-primary/80">Terms</a> and <a href="#" className="text-primary underline hover:text-primary/80">Privacy Policy</a>.
        </p>
      </div>
    </form>
  )
}

/* ── Auth Form Container ── */

function AuthFormContainer({
  isSignIn,
  onToggle,
  onSignIn,
  onSignUp,
  loading,
  onGoogleSignIn,
  onForgotPassword,
  authError,
}: {
  isSignIn: boolean
  onToggle: () => void
  onSignIn?: (data: { email: string; password: string }) => Promise<void> | void
  onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void> | void
  loading?: boolean
  onGoogleSignIn?: () => void
  onForgotPassword?: () => void
  authError?: string
}) {
  const { t } = useTranslation()
  const [direction, setDirection] = useState(0) // -1 = left (signin→signup), 1 = right (signup→signin)

  const handleToggle = () => {
    setDirection(isSignIn ? -1 : 1)
    onToggle()
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">MailMind</p>
          <p className="text-sm text-muted-foreground">Secure access for your agency.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{isSignIn ? 'Log in' : 'Sign up'}</span>
      </div>
      <div className="grid gap-3">
        <Button variant="outline" type="button" onClick={onGoogleSignIn} className="w-full justify-center">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('auth.google_button')}
        </Button>
        <div className="relative text-center text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <span className="relative z-10 bg-background px-3">{t('auth.or_continue')}</span>
          <div className="absolute inset-0 top-1/2 border-t border-border" />
        </div>
      </div>
      <div className="rounded-[32px] border border-border bg-background/95 p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl">
        <ErrorBanner message={authError} />
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              {isSignIn ? (
                <SignInForm onSignIn={onSignIn} onForgotPassword={onForgotPassword} loading={loading} />
              ) : (
                <SignUpForm onSignUp={onSignUp} loading={loading} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {isSignIn ? t('auth.no_account') + ' ' : t('auth.has_account') + ' '}
        <Button variant="link" className="pl-1 text-foreground" onClick={handleToggle}>
          {isSignIn ? t('auth.sign_up_link') : t('auth.sign_in_link')}
        </Button>
      </div>
    </div>
  )
}

/* ── MailMind Brand Panel ── */

const specialistIcons = [
  { icon: Search, label: 'Researcher', color: 'bg-emerald-500', bg: 'bg-emerald-500/15' },
  { icon: Brain, label: 'Psychologist', color: 'bg-amber-500', bg: 'bg-amber-500/15' },
  { icon: Target, label: 'Strategist', color: 'bg-indigo-500', bg: 'bg-indigo-500/15' },
  { icon: PenTool, label: 'Copywriter', color: 'bg-rose-500', bg: 'bg-rose-500/15' },
]

function MailMindBrandPanel() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
      {/* Animated orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-copper/10 to-purple-500/10 blur-3xl"
        animate={{
          x: [0, 30, -20, 10, 0],
          y: [0, -20, 15, -10, 0],
          scale: [1, 1.05, 0.95, 1.02, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/10 to-copper/10 blur-3xl"
        animate={{
          x: [0, -20, 30, -10, 0],
          y: [0, 15, -20, 10, 0],
          scale: [1, 0.95, 1.05, 0.98, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-12 h-12 bg-copper rounded-xl flex items-center justify-center shadow-lg shadow-red-200/30"
          whileHover={{ rotate: -10, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <span className="text-white text-lg font-extrabold tracking-tight">M</span>
        </motion.div>
        <span className="text-white text-2xl font-bold tracking-tight">MailMind</span>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="text-white/60 text-sm font-medium mb-10 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Cold email, but it actually knows them.
      </motion.p>

      {/* Specialist cards */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.3 },
          },
        }}
      >
        {specialistIcons.map((s, i) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] as const },
              },
            }}
            className={`${s.bg} backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2.5`}
          >
            <motion.div
              className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center shadow-sm`}
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              <s.icon size={14} className="text-white" />
            </motion.div>
            <span className="text-white/80 text-xs font-semibold">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-copper/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
        <Sparkles size={12} className="text-white/40" />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-copper/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </motion.div>
    </div>
  )
}

/* ── Content Props ── */

interface AuthContentProps {
  quote?: { text: string; author: string }
}

/* ── AuthUI Props ── */

interface AuthUIProps {
  isSignIn?: boolean
  signInContent?: AuthContentProps
  signUpContent?: AuthContentProps
  onSignIn?: (data: { email: string; password: string }) => Promise<void> | void
  onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void> | void
  onGoogleSignIn?: () => void
  onForgotPassword?: () => void
  loading?: boolean
  authError?: string
}

const defaultSignInQuote = {
  text: 'Welcome Back! The journey continues.',
  author: 'MailMind',
}

const defaultSignUpQuote = {
  text: 'Create an account. A new chapter awaits.',
  author: 'MailMind',
}

export function AuthUI({
  isSignIn: initialIsSignIn,
  signInContent = {},
  signUpContent = {},
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onForgotPassword,
  loading,
  authError,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn !== undefined ? initialIsSignIn : true)
  const toggleForm = () => setIsSignIn((prev) => !prev)

  const finalQuote = isSignIn
    ? { ...defaultSignInQuote, ...signInContent?.quote }
    : { ...defaultSignUpQuote, ...signUpContent?.quote }

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-[minmax(0,420px)_1fr]">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-[32px] border border-border bg-background/95 p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <AuthFormContainer
            isSignIn={isSignIn}
            onToggle={toggleForm}
            onSignIn={onSignIn}
            onSignUp={onSignUp}
            loading={loading}
            onGoogleSignIn={onGoogleSignIn}
            onForgotPassword={onForgotPassword}
            authError={authError}
          />
        </div>
      </div>

      <div className="hidden md:block relative overflow-hidden bg-[#111111] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,159,39,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative flex h-full flex-col justify-center p-10">
          <div className="max-w-lg rounded-[32px] border border-white/10 bg-[#111111]/95 p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700 font-semibold">Au</div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Aurelius</p>
                <p className="text-sm text-white/70">Your agency mentor</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#111111] p-6 text-lg leading-8 text-white shadow-sm shadow-black/20">
              Welcome. Let&apos;s build something that actually works for your agency.
            </div>
          </div>
          <div className="mt-10 max-w-sm text-sm text-white/70">
            <p className="mb-4">MailMind helps agencies keep the stack they already use, while adding a smarter orchestration layer for outreach, campaigns, and client-ready workflows.</p>
            <blockquote className="rounded-3xl border-l-4 border-amber-400 bg-white/5 p-4 text-sm text-white/80">
              &ldquo;We cut campaign setup time in half and still kept full control over every message.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}
