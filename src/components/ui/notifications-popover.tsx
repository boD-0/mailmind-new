'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Sparkles, AlertTriangle, Clock, CheckCircle2, X, Trash2, ExternalLink, Brain, Target, PenTool, Search, FlaskConical, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNotificationStore, Notification, NotificationType } from '@/stores/notificationStore'

/* ── Agent icon map ── */

const AGENT_ICONS: Record<string, typeof Sparkles> = {
  researcher: Search,
  psychologist: Brain,
  strategist: Target,
  copywriter: PenTool,
  consensus: CheckCircle2,
  approval_gate: ShieldCheck,
  sandbox: FlaskConical,
}

/* ── Type-specific config ── */

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; bg: string; text: string }> = {
  swarm_complete: { icon: Sparkles, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  swarm_error:   { icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-600' },
  deadline:      { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600' },
  incomplete_task: { icon: AlertTriangle, bg: 'bg-orange-50', text: 'text-orange-600' },
  info:          { icon: Sparkles, bg: 'bg-blue-50', text: 'text-blue-600' },
}

/* ── Single notification row ── */

function NotificationRow({ notif }: { notif: Notification }) {
  const { markAsRead, removeNotification } = useNotificationStore()

  const agentIcon = notif.swarmAgent ? AGENT_ICONS[notif.swarmAgent] : undefined
  const Icon: LucideIcon = (notif.type === 'swarm_complete' && agentIcon) ? agentIcon : TYPE_CONFIG[notif.type].icon

  const timeAgo = getTimeAgo(notif.timestamp)

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group',
        notif.unread ? 'bg-copper/5' : 'hover:bg-muted'
      )}
      onClick={() => markAsRead(notif.id)}
    >
      {/* Icon */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        TYPE_CONFIG[notif.type].bg
      )}>
        <Icon className={cn('w-4 h-4', TYPE_CONFIG[notif.type].text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{notif.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] text-muted-foreground font-medium">{timeAgo}</span>
          {notif.actionLabel && (
            <a
              href={notif.actionHref || '#'}
              className="text-[9px] font-bold text-copper hover:underline flex items-center gap-0.5"
            >
              {notif.actionLabel}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {notif.unread && (
        <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-copper" />
      )}

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id) }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200 text-muted-foreground hover:text-muted-foreground"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

/* ── Time ago helper ── */

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

/* ── Empty state ── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-10 px-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground/80 mb-1">All clear</p>
      <p className="text-[10px] text-muted-foreground max-w-[180px]">
        Notifications about swarm completions, deadlines, and tasks will appear here.
      </p>
    </div>
  )
}

/* ── Main component ── */

export function NotificationsPopover() {
  const { notifications, markAllAsRead, clearAll } = useNotificationStore()

  const unreadCount = notifications.filter((n) => n.unread).length

  // Group by type
  const grouped = notifications.slice(0, 20)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground/80 transition-colors" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[9px] font-bold bg-copper text-white border-2 border-white rounded-full shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[380px] p-0 bg-white border-border shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-copper" />
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-semibold text-copper hover:text-copper transition-colors px-2 py-1 rounded-lg hover:bg-copper/5"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-1">
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence initial={false}>
              {grouped.map((notif) => (
                <NotificationRow key={notif.id} notif={notif} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground font-medium">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAll}
              className="text-[9px] font-bold text-muted-foreground hover:text-muted-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
