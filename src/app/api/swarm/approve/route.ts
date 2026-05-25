import { NextResponse } from 'next/server'
import { safeJsonParse } from "@/lib/utils";
import { apiRequireAuth, verifyOwnership } from "@/lib/auth/gatekeeper";
import { resumeSwarmFromCopywriter } from "@/lib/swarm/resume";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const text = await request.text();
    const data = safeJsonParse<{ campaignId?: string }>(text, {});

    if (!data?.campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    // Verify ownership
    const supabase = await createClient();
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('user_id, status, confidence_score')
      .eq('id', data.campaignId)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const ownershipError = verifyOwnership(campaign.user_id, user.id);
    if (ownershipError) return ownershipError;

    // Validate that the campaign is awaiting approval
    if (campaign.status !== 'awaiting_approval' && campaign.status !== 'ready_for_copywriter') {
      return NextResponse.json({
        error: `Campaign is in status "${campaign.status}" — can only approve from "awaiting_approval" or "ready_for_copywriter".`,
      }, { status: 409 });
    }

    // Resume the swarm from the approval gate (skips to copywriter)
    const finalState = await resumeSwarmFromCopywriter(data.campaignId, user.id);

    return NextResponse.json({
      message: 'Approved and resumed successfully',
      email_draft: finalState.email_draft,
      confidence_score: finalState.confidence_score,
    });
  } catch (error) {
    console.error("Approve API Error:", error);
    const message = error instanceof Error ? error.message : 'Failed to approve step';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
