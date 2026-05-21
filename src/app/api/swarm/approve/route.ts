import { NextResponse } from 'next/server'
import { safeJsonParse } from "@/lib/utils";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";

export async function POST(request: Request) {
  // Require authentication
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  try {    const text = await request.text();
    const data = safeJsonParse(text, null);
    
    if (!data) {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }
    
    // Logica de aprobare manuală pentru a trece la pasul următor (ex: Copywriter)
    return NextResponse.json({ message: 'Step approved', status: 'resuming', data, userId: user.id })
  } catch (error) {
    console.error("Approve API Error:", error);
    return NextResponse.json({ error: 'Failed to approve step or invalid JSON' }, { status: 500 })
  }
}
