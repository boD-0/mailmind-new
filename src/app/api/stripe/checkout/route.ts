import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getPostHogClient } from '@/lib/posthog-server';
import { safeJsonParse } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = safeJsonParse<{ planId?: string }>(text, {});
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mapăm ID-urile planurilor la Price ID-urile din Stripe
    // În realitate, acestea ar veni din config sau DB
    const priceMap: Record<string, string> = {
      'fast_scan': process.env.STRIPE_PRICE_ID_FAST || '',
      'deep_simulation': process.env.STRIPE_PRICE_ID_DEEP || '',
    };

    const priceId = priceMap[planId];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    });

    getPostHogClient().capture({
      distinctId: user.id,
      event: 'checkout_initiated',
      properties: { plan_id: planId, stripe_session_id: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
