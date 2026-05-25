import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getPostHogClient } from '@/lib/posthog-server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const checkoutType = session.metadata?.type;

    // ─── Swarm Credits purchase (one-time payment) ────────────────────
    if (checkoutType === 'swarm_credits' && userId) {
      const quantity = parseInt(session.metadata?.quantity || '1', 10);
      const creditsToAdd = quantity * 10; // 1 pack = 10 swarms

      const [result] = await db
        .update(users)
        .set({
          swarmCredits: sql`swarm_credits + ${creditsToAdd}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ newBalance: users.swarmCredits });

      if (result) {
        console.log(`[Stripe] Credits purchased: +${creditsToAdd} → user ${userId.slice(0, 8)}… (balance: ${result.newBalance})`);

        getPostHogClient().capture({
          distinctId: userId,
          event: 'credits_purchased',
          properties: {
            quantity,
            credits_added: creditsToAdd,
            new_balance: result.newBalance,
            stripe_session_id: session.id,
          },
        });
      }
      return NextResponse.json({ received: true });
    }

    // ─── Subscription plan purchase ──────────────────────────────────
    const planId = session.metadata?.planId;

    if (userId && planId) {
      // Update user subscription plan
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
