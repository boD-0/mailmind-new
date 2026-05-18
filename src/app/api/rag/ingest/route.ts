import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ingestDocument } from '@/lib/rag/ingest';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const campaignId = formData.get('campaignId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Citim conținutul fișierului (pentru simplitate text/pdf)
    // În realitate, am folosi biblioteci de tip pdf-parse pentru PDF-uri
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
