'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Zap, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ApiLimitNotificationProps {
  /** API usage percentage (0-100) */
  usagePercent: number
  /** Current plan name */
  planName?: string
  /** Whether the user has exceeded their limit */
  isExceeded?: boolean
  /** Called when user clicks upgrade */
  onUpgrade?: () => void
  /** Called when user dismisses the notification */
  onDismiss?: () => void
}

export function ApiLimitNotification({
  usagePercent,
  planName = 'Free',
  isExceeded = false,
  onUpgrade,
  onDismiss,
}: ApiLimitNotificationProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed) return null

  const getTitle = () => {
    if (isExceeded) return 'API limit exceeded'
    if (usagePercent >= 100) return 'Out of API credits'
    if (usagePercent >= 80) return 'Running low on API credits'
    return 'API usage warning'
  }

  const getDescription = () => {
    if (isExceeded) {
      return `You've used all your API credits on the ${planName} plan. Upgrade to continue using MailMind without interruptions.`
    }
    return `You've used ${usagePercent}% of your API credits on the ${planName} plan. Upgrade for higher limits and priority access.`
  }

  const iconColor = isExceeded || usagePercent >= 100 ? 'text-red-500' : 'text-amber-500';
  const IconComponent = isExceeded || usagePercent >= 100 ? AlertTriangle : Zap;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-md"
      >
        <Alert
          variant={isExceeded || usagePercent >= 100 ? 'destructive' : 'default'}
          className={cn(
            'shadow-lg',
            !isExceeded && usagePercent < 100 && 'border-amber-200 bg-amber-50'
          )}
        >
          <IconComponent className={cn('size-5', iconColor)} />
          <div className="pl-7">
            <AlertTitle className="text-sm font-semibold">
              {getTitle()}
            </AlertTitle>
            <AlertDescription>
              <p className="text-xs text-muted-foreground">{getDescription()}</p>
            </AlertDescription>

            {/* Usage bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Usage</span>
                <span className="font-mono font-bold">{usagePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    isExceeded || usagePercent >= 100 ? 'bg-red-500' :
                    usagePercent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                  )}
                />
              </div>
            </div>

            {/* Upgrade button */}
            {onUpgrade && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isExceeded ? 'destructive' : 'default'}
                  onClick={onUpgrade}
                >
                  <Zap className="size-3.5" />
                  Upgrade Plan
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  <X className="size-3.5" />
                  Dismiss
                </Button>
              </div>
            )}

            {/* Exceeded state - persistent */}
            {isExceeded && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-[10px] text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  Some features are disabled until you upgrade
                </p>
              </div>
            )}
          </div>
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </Alert>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Hook to get API usage percentage for the current user's plan.
 * Returns a percentage 0-100 based on plan limits.
 */
export function useApiUsage() {
  const [usagePercent, setUsagePercent] = useState(0)

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const res = await fetch('/api/usage')
        if (res.ok) {
          const data = await res.json()
          setUsagePercent(data.usagePercent || 0)
        }
      } catch {
        // Silently fail
      }
    }
    checkUsage()
  }, [])

  return { usagePercent }
}
