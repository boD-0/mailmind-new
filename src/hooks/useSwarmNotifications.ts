'use client'

import { useEffect, useRef } from 'react'
import { useSwarmStore } from '@/stores/swarmStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { checkDeadlines } from '@/app/actions/deadlines'

export function useSwarmNotifications() {
  const { traceLogs, status, activeAgent } = useSwarmStore()
  const { addNotification } = useNotificationStore()
  const lastLogCount = useRef(0)
  const notifiedStatuses = useRef<Set<string>>(new Set())
  const notifiedDeadlines = useRef<Set<string>>(new Set())

  useEffect(() => {
    // ── 1. Notify when a swarm agent finishes ──
    if (traceLogs.length > lastLogCount.current) {
      const newLogs = traceLogs.slice(lastLogCount.current)

      for (const log of newLogs) {
        if (log.status === 'done') {
          const agentKey = `${log.agent}-${log.timestamp}`
          if (notifiedStatuses.current.has(agentKey)) continue
          notifiedStatuses.current.add(agentKey)

          const agentLabel = log.agent.charAt(0).toUpperCase() + log.agent.slice(1).replace(/_/g, ' ')
          addNotification({
            type: 'swarm_complete',
            title: `${agentLabel} finished`,
            message: log.message,
            swarmAgent: log.agent,
            actionLabel: 'View swarm',
            actionHref: '/dashboard/war-room',
          })
        }

        if (log.status === 'conflict') {
          const agentKey = `conflict-${log.agent}-${log.timestamp}`
          if (notifiedStatuses.current.has(agentKey)) continue
          notifiedStatuses.current.add(agentKey)

          addNotification({
            type: 'swarm_error',
            title: `${log.agent} encountered an error`,
            message: log.message,
            swarmAgent: log.agent,
            actionLabel: 'Review',
            actionHref: '/dashboard/war-room',
          })
        }
      }

      lastLogCount.current = traceLogs.length
    }
  }, [traceLogs, addNotification])

  // ── 2. Notify when swarm finishes completely ──
  useEffect(() => {
    if (status === 'consensus_reached' || status === 'awaiting_approval') {
      const key = `status-${status}`
      if (notifiedStatuses.current.has(key)) return
      notifiedStatuses.current.add(key)

      if (status === 'consensus_reached') {
        addNotification({
          type: 'swarm_complete',
          title: 'Swarm reached consensus',
          message: 'All agents have voted. The campaign strategy is ready for review.',
          actionLabel: 'Review strategy',
          actionHref: '/dashboard/war-room',
        })
      }

      if (status === 'awaiting_approval') {
        addNotification({
          type: 'swarm_complete',
          title: 'Campaign ready for approval',
          message: 'Research complete and strategy is drafted. Your approval is needed.',
          actionLabel: 'Approve now',
          actionHref: '/dashboard/war-room',
        })
      }
    }
  }, [status, addNotification])

  // ── 3. Warn if swarm was interrupted (incomplete task) ──
  useEffect(() => {
    if (status === 'idle' && activeAgent !== null && lastLogCount.current > 0) {
      const key = 'incomplete-swarm'
      if (notifiedStatuses.current.has(key)) return
      notifiedStatuses.current.add(key)

      addNotification({
        type: 'incomplete_task',
        title: 'Swarm was interrupted',
        message: `The swarm was paused while "${activeAgent}" was active. You can resume from where it left off.`,
        actionLabel: 'Resume',
        actionHref: '/dashboard/war-room',
      })
    }
  }, [status, activeAgent, addNotification])

  // ── 4. Check for approaching deadlines ──
  useEffect(() => {
    let cancelled = false

    async function pollDeadlines() {
      try {
        const alerts = await checkDeadlines()

        for (const alert of alerts) {
          const alertKey = `${alert.id}-${alert.type}`
          if (notifiedDeadlines.current.has(alertKey)) continue
          notifiedDeadlines.current.add(alertKey)

          const deadlineDate = new Date(alert.deadline)
          const formattedDate = deadlineDate.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })

          if (alert.type === 'overdue') {
            addNotification({
              type: 'deadline',
              title: `⚠ Deadline overdue: ${alert.projectName}`,
              message: `The deadline was on ${formattedDate}. This project needs attention.`,
              actionLabel: 'Open project',
              actionHref: '/dashboard/war-room',
            })
          } else if (alert.type === 'within_24h') {
            addNotification({
              type: 'deadline',
              title: `🚨 Urgent: ${alert.projectName}`,
              message: `Deadline is in less than 24 hours (${formattedDate}). Finalize before time runs out.`,
              actionLabel: 'View project',
              actionHref: '/dashboard/war-room',
            })
          } else if (alert.type === 'within_7d') {
            addNotification({
              type: 'deadline',
              title: `📅 Upcoming deadline: ${alert.projectName}`,
              message: `Due on ${formattedDate} — ${Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining.`,
              actionLabel: 'Prepare now',
              actionHref: '/dashboard/war-room',
            })
          }
        }
      } catch {
        // Silently fail — deadlines are not essential for the UI to work
      }
    }

    // Check on mount
    pollDeadlines()

    // Re-check every 5 minutes
    const interval = setInterval(() => {
      if (!cancelled) pollDeadlines()
    }, 5 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [addNotification])
}
