import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ingestDocument } from '@/lib/rag/ingest';
import { apiRequireAuth, verifyOwnership } from "@/lib/auth/gatekeeper";

export async function POST(req: Request) {
  // Authenticate via better-auth (consistent auth system)
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const campaignId = formData.get('campaignId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // If campaignId provided, verify the user owns this campaign
    if (campaignId) {
      const supabase = await createClient();
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('user_id')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const ownershipError = verifyOwnership(campaign.user_id, user.id);
      if (ownershipError) return ownershipError;
    }

    // Citim conținutul fișierului (pentru simplitate text/pdf)
    const content = await file.text();

    const result = await ingestDocument(
      content,
      file.name,
      user.id,
      campaignId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("RAG Ingest API Error:", error);
    return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
  }
}
