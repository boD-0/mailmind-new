import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ingestDocument, parsePdfBuffer } from '@/lib/rag/ingest';
import { apiRequireAuth, verifyOwnership, checkFeatureAccess } from "@/lib/auth/gatekeeper";
import { tieredUploadRateLimit } from "@/lib/rate-limit";
import { sanitizeAiInput } from '@/lib/sanitize';

export async function POST(req: Request) {
  // Authenticate via better-auth (consistent auth system)
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  // Check plan feature access: vault ingestion requires at least STARTER
  if (!checkFeatureAccess(user.plan, "hasVault")) {
    return NextResponse.json(
      { error: "Vault access requires at least the STARTER plan." },
      { status: 403 }
    );
  }

  // Tiered rate limit: FREE=2/min, STARTER=5/min, PROFESSIONAL=10/min
  const rateLimitResult = await tieredUploadRateLimit(user.plan, user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Upload limit reached. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      },
    );
  }

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

    // Extrahe conținutul — PDF-urile au nevoie de parsing special
    let content: string;
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      content = await parsePdfBuffer(buffer);
    } else {
      content = await file.text();
    }

    // Sanitize content for prompt injection before ingestion
    const sanitizeCheck = sanitizeAiInput(content);
    if (!sanitizeCheck.clean) {
      return NextResponse.json(
        { error: `Document contains suspicious content: ${sanitizeCheck.reason}` },
        { status: 400 },
      );
    }
    const safeContent = sanitizeCheck.sanitized;

    if (!safeContent || safeContent.trim().length === 0) {
      return NextResponse.json({ error: 'Empty or unparseable document' }, { status: 400 });
    }

    const result = await ingestDocument(
      safeContent,
      fileName,
      user.id,
      campaignId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("RAG Ingest API Error:", error);
    return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
  }
}
