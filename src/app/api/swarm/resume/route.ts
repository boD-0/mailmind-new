import { NextResponse } from "next/server";
import { apiRequireAuth, verifyOwnership } from "@/lib/auth/gatekeeper";
import { resumeSwarmFromCopywriter, getResumableState } from "@/lib/swarm/resume";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
  }

  // Check resumable state
  const state = await getResumableState(campaignId);
  return NextResponse.json({ campaignId, resumable: state });
}

export async function POST(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    // Verify ownership
    const supabase = await createClient();
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_id")
      .eq("id", campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const ownershipError = verifyOwnership(campaign.user_id, user.id);
    if (ownershipError) return ownershipError;

    const finalState = await resumeSwarmFromCopywriter(campaignId, user.id);

    return NextResponse.json({
      message: "Swarm resumed and completed",
      email_draft: finalState.email_draft,
      confidence_score: finalState.confidence_score,
    });
  } catch (error) {
    console.error("Resume error:", error);
    const message = error instanceof Error ? error.message : "Failed to resume swarm";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
