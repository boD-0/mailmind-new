import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeJsonParse } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = safeJsonParse<{ campaignId?: string }>(text, {});
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Obținem utilizatorul curent
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verificăm că există aprobare explicită în DB pentru acest utilizator și campanie
    const { data: approval, error: approvalError } = await supabase
      .from('klaviyo_approvals')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (approvalError || !approval?.approved_at) {
      return NextResponse.json({ error: 'No manual approval found' }, { status: 403 });
    }

    // 3. Trimite datele prospectului la Klaviyo
    const response = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'Revision': '2023-02-22' // Revision necesar pentru Klaviyo API
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: approval.prospect_email,
            properties: { 
              source: 'MailMind', 
              campaign_id: campaignId,
              synced_from: 'MailMind_V4'
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Klaviyo API Error:", errorData);
      return NextResponse.json({ error: 'Failed to sync with Klaviyo' }, { status: 502 });
    }

    // 4. Marcăm ca fiind sincronizat
    await supabase
      .from('klaviyo_approvals')
      .update({ synced_at: new Date().toISOString() })
      .eq('id', approval.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Klaviyo Sync Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
