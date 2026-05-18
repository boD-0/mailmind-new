import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getPostHogClient } from '@/lib/posthog-server';

// Folosim clientul admin pentru a ignora RLS în webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Gestionăm evenimentul
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      // Actualizăm planul de subscripție al utilizatorului
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_plan: planId,
          subscription_status: 'active'
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user subscription:', error);
        return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
      }

      getPostHogClient().capture({
        distinctId: userId,
        event: 'subscription_activated',
        properties: {
          plan_id: planId,
          stripe_session_id: session.id,
          customer_email: session.customer_email ?? null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
