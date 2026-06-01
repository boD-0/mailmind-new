import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { safeJsonParse } from "@/lib/utils";

/**
 * POST /api/stripe/credits/checkout
 *
 * Creates a Stripe Checkout session for purchasing swarm credit packs.
 * Requires authentication.
 *
 * Body: { quantity?: number } — number of credit packs (default: 1)
 * Each pack = 10 extra swarm executions.
 *
 * Returns: { url: string } — Stripe Checkout URL
 */
export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const text = await req.text();
    const body = safeJsonParse<{ quantity?: number }>(text, {});
    const quantity = Math.max(1, Math.min(50, body.quantity ?? 1));

    const priceId = process.env.STRIPE_CREDITS_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Credits price not configured. Set STRIPE_CREDITS_PRICE_ID." },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard?credits_purchased=${quantity}`,
      cancel_url: `${appUrl}/dashboard`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        type: "swarm_credits",
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe] Credits checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
