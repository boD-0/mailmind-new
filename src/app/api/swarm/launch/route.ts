import { NextResponse } from 'next/server'
import { swarmGraph } from '@/lib/swarm/graph'
import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { safeJsonParse } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const body = safeJsonParse<{ campaignId?: string }>(text, {});
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }
    
    const supabase = await createClient()
    
    // Preluăm datele campaniei
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Preluăm datele de onboarding și subscripție
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_data, subscription_plan')
      .eq('id', campaign.user_id)
      .single()

    const swarm_mode = (profile?.subscription_plan === 'fast_scan' ? 'fast' : 'deep') as 'fast' | 'deep'

    // Pornim graful în mod asincron (non-blocking pentru UI)
    const initialState = {
      campaign_id: campaignId,
      prospect_name: campaign.prospect_name || "Prospect",
      prospect_url: campaign.prospect_url || "",
      brand_context: profile?.onboarding_data || {},
      swarm_mode,
      status: 'swarm_running' as const,
      confidence_score: 0,
      active_agent: 'researcher' as const,
      trace_log: []
    }

    // Rulăm graful
    // Notă: invoke() este blocant. Pentru un flux real, am putea folosi stream()
    // sau am putea rula asincron și returna imediat un status.
    swarmGraph.invoke(initialState).then(async (finalState) => {
      // Salvăm rezultatul final în baza de date
      await supabase
        .from('campaigns')
        .update({
          research_data: finalState.research_data,
          twin_profile: finalState.twin_profile,
          strategy: finalState.strategy,
          email_draft: finalState.email_draft,
          confidence_score: finalState.confidence_score,
          status: 'consensus_reached'
        })
        .eq('id', campaignId)
    })

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: campaign.user_id,
      event: 'swarm_launched',
      properties: {
        campaign_id: campaignId,
        swarm_mode,
        prospect_name: campaign.prospect_name || null,
      },
    })

    return NextResponse.json({ message: 'Swarm launched', status: 'running' })
  } catch (error) {
    console.error("Launch error:", error)
    return NextResponse.json({ error: 'Failed to launch swarm' }, { status: 500 })
  }
}
