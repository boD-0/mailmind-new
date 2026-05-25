import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { apiRequireAuth } from '@/lib/auth/gatekeeper'

/**
 * SSE (Server-Sent Events) endpoint for real-time swarm event streaming.
 *
 * The client opens a persistent connection and receives `agent_update` events
 * as they are broadcast by the swarm graph via Supabase Realtime.
 *
 * Usage:
 *   const es = new EventSource(`/api/swarm/stream?campaignId=${id}`)
 *   es.onmessage = (e) => { const payload = JSON.parse(e.data); ... }
 */
export async function GET(request: NextRequest) {
  const user = await apiRequireAuth(request)
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
  }

  // Verify ownership
  const supabase = await createClient()
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('user_id')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Build SSE stream relay from Supabase Realtime → client
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ campaignId, timestamp: Date.now() })}\n\n`)
      )

      // Use service role for server-side broadcast subscription (no cookie auth needed)
      const serviceClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const channel = serviceClient.channel(`swarm:${campaignId}`)

      channel
        .on('broadcast', { event: 'agent_update' }, (msg) => {
          const payload = msg.payload
          controller.enqueue(
            encoder.encode(`event: agent_update\ndata: ${JSON.stringify(payload)}\n\n`)
          )
        })
        .on('broadcast', { event: 'swarm_status' }, (msg) => {
          const payload = msg.payload
          controller.enqueue(
            encoder.encode(`event: swarm_status\ndata: ${JSON.stringify(payload)}\n\n`)
          )
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            controller.enqueue(
              encoder.encode(`event: subscribed\ndata: ${JSON.stringify({ campaignId })}\n\n`)
            )
          }
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            controller.close()
          }
        })

      // Keep-alive ping every 15 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepAlive)
        }
      }, 15_000)

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        serviceClient.removeChannel(channel)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
