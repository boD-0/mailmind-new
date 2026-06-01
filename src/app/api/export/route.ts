import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/vault/signed-url';
import { getPostHogClient } from '@/lib/posthog-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const format = searchParams.get('format'); // 'docx' | 'txt'

    if (!campaignId || !format) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Obținem utilizatorul curent
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 2. Verificăm că utilizatorul deține campania
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Forbidden or Campaign not found' }, { status: 403 });
    }

    // 3. Determinăm path-ul fișierului în storage
    // Notă: Presupunem că procesul de export/salvare a generat deja fișierul
    // Path-ul este de forma: {userId}/{campaignId}/export.{format}
    const filePath = `${userId}/${campaignId}/export.${format}`;

    // 4. Generăm signed URL și redirecționăm
    try {
      const signedUrl = await getSignedUrl(userId, filePath);
      getPostHogClient().capture({
        distinctId: userId,
        event: 'campaign_exported',
        properties: { campaign_id: campaignId, format },
      });
      return NextResponse.redirect(signedUrl);
    } catch (err) {
      console.error("Export generation error:", err);
      return NextResponse.json({ error: 'File not found or export not ready' }, { status: 404 });
    }
  } catch (error) {
    console.error("API Export Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
