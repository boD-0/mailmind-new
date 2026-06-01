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
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
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
        <PasswordInput
          name="password"
          label={t('auth.password_label')}
          required
          autoComplete="new-password"
          placeholder={t('auth.password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="mt-2 w-full" loading={loading}>
          {t('auth.sign_up_button')}
        </Button>
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
}: {
  isSignIn: boolean
  onToggle: () => void
  onSignIn?: (data: { email: string; password: string }) => Promise<void> | void
  onSignUp?: (data: { name: string; email: string; password: string }) => Promise<void> | void
  loading?: boolean
  onGoogleSignIn?: () => void
  onForgotPassword?: () => void
}) {
  const { t } = useTranslation()
  const [direction, setDirection] = useState(0) // -1 = left (signin→signup), 1 = right (signup→signin)

  const handleToggle = () => {
    setDirection(isSignIn ? -1 : 1)
    onToggle()
  }

  return (
    <div className="mx-auto grid w-[350px] gap-2">
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
      <div className="text-center text-sm text-muted-foreground">
        {isSignIn ? t('auth.no_account') + ' ' : t('auth.has_account') + ' '}
        <Button variant="link" className="pl-1 text-foreground" onClick={handleToggle}>
          {isSignIn ? t('auth.sign_up_link') : t('auth.sign_in_link')}
        </Button>
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">{t('auth.or_continue')}</span>
      </div>
      <Button variant="outline" type="button" onClick={onGoogleSignIn} className="w-full">
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t('auth.google_button')}
      </Button>
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
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn !== undefined ? initialIsSignIn : true)
  const toggleForm = () => setIsSignIn((prev) => !prev)

  const finalQuote = isSignIn
    ? { ...defaultSignInQuote, ...signInContent?.quote }
    : { ...defaultSignUpQuote, ...signUpContent?.quote }

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer
          isSignIn={isSignIn}
          onToggle={toggleForm}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          loading={loading}
          onGoogleSignIn={onGoogleSignIn}
          onForgotPassword={onForgotPassword}
        />
      </div>

      <div
        className="hidden md:block relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#222] to-[#111] transition-all duration-500 ease-in-out"
      >
        {/* Brand panel with specialists */}
        <MailMindBrandPanel />

        {/* Gradient overlay at bottom for quote */}
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-8">
          <blockquote className="space-y-2 text-center text-foreground max-w-md">
            <p className="text-lg font-medium text-white drop-shadow-lg">
              &ldquo;
              <Typewriter
                key={finalQuote.text}
                text={finalQuote.text}
                speed={50}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-light text-white/70 not-italic drop-shadow">
              — {finalQuote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
